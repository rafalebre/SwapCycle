import os
import uuid
from werkzeug.utils import secure_filename
from PIL import Image
import logging
from config import Config

class FileService:
    
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    IMAGE_SIZES = {
        'thumbnail': (200, 200),
        'medium': (600, 600),
        'large': (1200, 1200)
    }
    
    @staticmethod
    def allowed_file(filename):
        """Check if file has allowed extension"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in FileService.ALLOWED_EXTENSIONS
    
    @staticmethod
    def generate_unique_filename(filename):
        """Generate unique filename while preserving extension"""
        if not filename:
            return None
        
        # Get file extension
        if '.' in filename:
            extension = filename.rsplit('.', 1)[1].lower()
        else:
            extension = 'jpg'  # Default extension
        
        # Generate unique filename
        unique_id = str(uuid.uuid4())
        return f"{unique_id}.{extension}"
    
    @staticmethod
    def get_upload_path(file_type, filename):
        """Get full upload path for file"""
        upload_folder = Config.UPLOAD_FOLDER
        
        if file_type == 'product':
            folder_path = os.path.join(upload_folder, 'products')
        elif file_type == 'service':
            folder_path = os.path.join(upload_folder, 'services')
        elif file_type == 'profile':
            folder_path = os.path.join(upload_folder, 'profiles')
        else:
            folder_path = upload_folder
        
        # Create directory if it doesn't exist
        os.makedirs(folder_path, exist_ok=True)
        
        return os.path.join(folder_path, filename)
    
    @staticmethod
    def validate_image_file(file):
        """Validate uploaded image file"""
        try:
            # Check file size
            file.seek(0, os.SEEK_END)
            file_size = file.tell()
            file.seek(0)
            
            if file_size > FileService.MAX_FILE_SIZE:
                return False, "File size exceeds 5MB limit"
            
            # Check if it's a valid image
            try:
                image = Image.open(file)
                image.verify()
                file.seek(0)  # Reset file pointer
                return True, "Valid image file"
            except Exception:
                return False, "Invalid image file"
                
        except Exception as e:
            logging.error(f"Error validating image file: {e}")
            return False, "Error validating file"
    
    @staticmethod
    def save_image(file, file_type='product', resize=True):
        """Save uploaded image with optional resizing"""
        try:
            # Validate file
            if not FileService.allowed_file(file.filename):
                return None, "File type not allowed"
            
            is_valid, message = FileService.validate_image_file(file)
            if not is_valid:
                return None, message
            
            # Generate unique filename
            unique_filename = FileService.generate_unique_filename(file.filename)
            if not unique_filename:
                return None, "Invalid filename"
            
            # Get upload path
            file_path = FileService.get_upload_path(file_type, unique_filename)
            
            # Save original file
            file.save(file_path)
            
            # Resize image if requested
            if resize:
                FileService.create_image_variants(file_path, file_type, unique_filename)
            
            # Return relative path for database storage
            relative_path = os.path.join(file_type + 's', unique_filename)
            return relative_path, "File saved successfully"
            
        except Exception as e:
            logging.error(f"Error saving image: {e}")
            return None, "Error saving file"
    
    @staticmethod
    def create_image_variants(original_path, file_type, filename):
        """Create different sized variants of uploaded image"""
        try:
            with Image.open(original_path) as image:
                # Convert to RGB if necessary
                if image.mode in ('RGBA', 'LA', 'P'):
                    image = image.convert('RGB')
                
                base_name = filename.rsplit('.', 1)[0]
                extension = filename.rsplit('.', 1)[1]
                
                for size_name, dimensions in FileService.IMAGE_SIZES.items():
                    # Create resized image
                    resized = image.copy()
                    resized.thumbnail(dimensions, Image.Resampling.LANCZOS)
                    
                    # Save variant
                    variant_filename = f"{base_n

cat > backend/services/file_service.py << 'EOF'
import os
import uuid
from werkzeug.utils import secure_filename
from PIL import Image
import logging
from config import Config

class FileService:
    
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    IMAGE_SIZES = {
        'thumbnail': (200, 200),
        'medium': (600, 600),
        'large': (1200, 1200)
    }
    
    @staticmethod
    def allowed_file(filename):
        """Check if file has allowed extension"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in FileService.ALLOWED_EXTENSIONS
    
    @staticmethod
    def generate_unique_filename(filename):
        """Generate unique filename while preserving extension"""
        if not filename:
            return None
        
        # Get file extension
        if '.' in filename:
            extension = filename.rsplit('.', 1)[1].lower()
        else:
            extension = 'jpg'  # Default extension
        
        # Generate unique filename
        unique_id = str(uuid.uuid4())
        return f"{unique_id}.{extension}"
    
    @staticmethod
    def get_upload_path(file_type, filename):
        """Get full upload path for file"""
        upload_folder = Config.UPLOAD_FOLDER
        
        if file_type == 'product':
            folder_path = os.path.join(upload_folder, 'products')
        elif file_type == 'service':
            folder_path = os.path.join(upload_folder, 'services')
        elif file_type == 'profile':
            folder_path = os.path.join(upload_folder, 'profiles')
        else:
            folder_path = upload_folder
        
        # Create directory if it doesn't exist
        os.makedirs(folder_path, exist_ok=True)
        
        return os.path.join(folder_path, filename)
    
    @staticmethod
    def validate_image_file(file):
        """Validate uploaded image file"""
        try:
            # Check file size
            file.seek(0, os.SEEK_END)
            file_size = file.tell()
            file.seek(0)
            
            if file_size > FileService.MAX_FILE_SIZE:
                return False, "File size exceeds 5MB limit"
            
            # Check if it's a valid image
            try:
                image = Image.open(file)
                image.verify()
                file.seek(0)  # Reset file pointer
                return True, "Valid image file"
            except Exception:
                return False, "Invalid image file"
                
        except Exception as e:
            logging.error(f"Error validating image file: {e}")
            return False, "Error validating file"
    
    @staticmethod
    def save_image(file, file_type='product', resize=True):
        """Save uploaded image with optional resizing"""
        try:
            # Validate file
            if not FileService.allowed_file(file.filename):
                return None, "File type not allowed"
            
            is_valid, message = FileService.validate_image_file(file)
            if not is_valid:
                return None, message
            
            # Generate unique filename
            unique_filename = FileService.generate_unique_filename(file.filename)
            if not unique_filename:
                return None, "Invalid filename"
            
            # Get upload path
            file_path = FileService.get_upload_path(file_type, unique_filename)
            
            # Save original file
            file.save(file_path)
            
            # Resize image if requested
            if resize:
                FileService.create_image_variants(file_path, file_type, unique_filename)
            
            # Return relative path for database storage
            relative_path = os.path.join(file_type + 's', unique_filename)
            return relative_path, "File saved successfully"
            
        except Exception as e:
            logging.error(f"Error saving image: {e}")
            return None, "Error saving file"
    
    @staticmethod
    def create_image_variants(original_path, file_type, filename):
        """Create different sized variants of uploaded image"""
        try:
            with Image.open(original_path) as image:
                # Convert to RGB if necessary
                if image.mode in ('RGBA', 'LA', 'P'):
                    image = image.convert('RGB')
                
                base_name = filename.rsplit('.', 1)[0]
                extension = filename.rsplit('.', 1)[1]
                
                for size_name, dimensions in FileService.IMAGE_SIZES.items():
                    # Create resized image
                    resized = image.copy()
                    resized.thumbnail(dimensions, Image.Resampling.LANCZOS)
                    
                    # Save variant
                    variant_filename = f"{base_name}_{size_name}.{extension}"
                    variant_path = FileService.get_upload_path(file_type, variant_filename)
                    resized.save(variant_path, quality=85, optimize=True)
                    
        except Exception as e:
            logging.error(f"Error creating image variants: {e}")
    
    @staticmethod
    def delete_file(file_path, file_type='product'):
        """Delete file and its variants"""
        try:
            if not file_path:
                return True
            
            # Delete main file
            full_path = FileService.get_upload_path(file_type, os.path.basename(file_path))
            if os.path.exists(full_path):
                os.remove(full_path)
            
            # Delete variants
            filename = os.path.basename(file_path)
            base_name = filename.rsplit('.', 1)[0]
            extension = filename.rsplit('.', 1)[1] if '.' in filename else 'jpg'
            
            for size_name in FileService.IMAGE_SIZES.keys():
                variant_filename = f"{base_name}_{size_name}.{extension}"
                variant_path = FileService.get_upload_path(file_type, variant_filename)
                if os.path.exists(variant_path):
                    os.remove(variant_path)
            
            return True
            
        except Exception as e:
            logging.error(f"Error deleting file: {e}")
            return False
    
    @staticmethod
    def get_file_url(file_path, size='medium'):
        """Get URL for accessing uploaded file"""
        if not file_path:
            return None
        
        filename = os.path.basename(file_path)
        
        if size != 'original':
            base_name = filename.rsplit('.', 1)[0]
            extension = filename.rsplit('.', 1)[1] if '.' in filename else 'jpg'
            filename = f"{base_name}_{size}.{extension}"
        
        return f"/static/uploads/{file_path.replace(os.path.basename(file_path), filename)}"
