import os
import time
from flask import Flask, request, jsonify
from PIL import Image




# --- Configuration ---
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

# IMPORTANT: Replace these with your actual Supabase credentials
SUPABASE_URL = 'https://evjqrlgjaknjlqmajvje.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2anFybGdqYWtuamxxbWFqdmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDg1ODgsImV4cCI6MjA3MzMyNDU4OH0.3SL1WH-_O2Mct2e3UZKQ4SrUIBjCua7dMC2_5yTawzU'

# Create directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# --- Flask App Setup ---
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# --- Supabase Client Setup ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def allowed_file(filename):
    """Check if the file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_image(image_path):
    """
    Extracts text from an image file using Tesseract OCR.
    Handles different image types.
    """
    try:
        text = pytesseract.image_to_string(Image.open(image_path))
        return text.strip()
    except Exception as e:
        app.logger.error(f"Error extracting text from image: {e}")
        return None

def extract_text_from_pdf(pdf_path):
    """
    Extracts text from a PDF file.
    Handles both text-based and scanned PDFs.
    """
    try:
        doc = fitz.open(pdf_path)
        full_text = ""
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            
            # First, try to extract text directly from the PDF
            text = page.get_text()
            if text.strip():
                full_text += text
            else:
                # If no text is found (scanned PDF), convert page to image and use OCR
                pix = page.get_pixmap(dpi=300)
                image_bytes = pix.tobytes("png")
                img = Image.open(image_bytes)
                page_text = pytesseract.image_to_string(img)
                full_text += page_text
        doc.close()
        return full_text.strip()
    except Exception as e:
        app.logger.error(f"Error extracting text from PDF: {e}")
        return None

@app.route('/upload', methods=['POST'])
def upload_file():
    """
    API endpoint to handle file uploads, text extraction, and Supabase storage.
    """
    # Check if a file was uploaded
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']
    
    # Check if the file is empty
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    # Check if the file type is allowed
    if not file or not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400
    
    # Secure the filename and save the file
    filename = file.filename
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    extracted_text = None
    file_extension = filename.rsplit('.', 1)[1].lower()

    if file_extension == 'pdf':
        extracted_text = extract_text_from_pdf(filepath)
    else:  # Assumes it's an image
        extracted_text = extract_text_from_image(filepath)
    
    # Clean up the temporary uploaded file
    os.remove(filepath)

    if extracted_text is None:
        return jsonify({"error": "Failed to extract text from the file."}), 500

    # Prepare data for Supabase
    data_to_save = {
        "original_filename": filename,
        "extracted_text": extracted_text,
        "timestamp": int(time.time())
    }
    
    try:
        # Insert data into the 'extracted_documents' table in Supabase
        supabase.table('extracted_documents').insert(data_to_save).execute()
    except Exception as e:
        app.logger.error(f"Error saving to Supabase: {e}")
        return jsonify({"error": "Failed to save extracted text to Supabase."}), 500
    
    # Return a success response
    return jsonify({
        "message": "Text extracted and saved to Supabase successfully."
    }), 200

if __name__ == '__main__':
    app.run(debug=True)

