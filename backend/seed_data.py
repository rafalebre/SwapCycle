from backend.app import create_app, db
from backend.models.product import ProductCategory, ProductSubcategory
from backend.models.service import ServiceCategory, ServiceSubcategory

def seed_product_categories():
    """Seed product categories and subcategories"""
    categories_data = {
        "Electronics": [
            "Computers", "Televisions", "Cameras and Photos", 
            "Cell Phones and Smartphones", "Electronic Accessories"
        ],
        "Home and Garden": [
            "Furniture", "Appliances", "Home Decor", "Gardening", "Home Improvements"
        ],
        "Clothing and Accessories": [
            "Women Clothing", "Men Clothing", "Shoes", "Accessories", "Children Clothing"
        ],
        "Health and Beauty": [
            "Skin Care Products", "Makeup", "Perfumes and Fragrances", "Hair Care", "Health"
        ],
        "Automotive": [
            "Vehicle Parts and Accessories", "Automotive Tools and Equipment", "Automotive Electronics"
        ],
        "Books, Music and Movies": [
            "Books and Ebooks", "Music", "Movies and Series", "Musical Instruments"
        ],
        "Sports and Fitness": [
            "Sports Equipment and Accessories", "Sportswear and Athletic Shoes", "Fitness Equipment"
        ],
        "Toys and Games": [
            "Toys", "Games", "Video Games and Consoles", "Educational Toys"
        ],
        "Babies and Children": [
            "Baby and Children Clothing", "Baby and Children Furniture and Decor", "Baby and Children Toys"
        ],
        "Food and Drinks": [
            "Grocery", "Alcoholic Beverages", "Non-Alcoholic Beverages", "Gourmet Products", "Healthy Foods"
        ],
        "Jewelry and Watches": [
            "Jewelry", "Watches", "Fashion Accessories"
        ],
        "Travel": [
            "Luggage and Travel Accessories", "Travel Accessories", "Travel Packages"
        ],
        "Business and Industrial": [
            "Office Equipment", "Construction Materials", "Industrial Equipment"
        ],
        "Art and Entertainment": [
            "Art", "Entertainment Memorabilia", "Party Supplies"
        ],
        "Animals and Pet Shop": [
            "Pet Food and Supplies", "Pet Accessories", "Pet Medications"
        ],
        "Other": [
            "Other"
        ]
    }
    
    for category_name, subcategories in categories_data.items():
        # Create category if it doesn't exist
        category = ProductCategory.query.filter_by(name=category_name).first()
        if not category:
            category = ProductCategory(name=category_name)
            db.session.add(category)
            db.session.flush()  # Flush to get the ID
            
        # Create subcategories
        for subcategory_name in subcategories:
            subcategory = ProductSubcategory.query.filter_by(
                name=subcategory_name, 
                category_id=category.id
            ).first()
            if not subcategory:
                subcategory = ProductSubcategory(
                    name=subcategory_name,
                    category_id=category.id
                )
                db.session.add(subcategory)

def seed_service_categories():
    """Seed service categories and subcategories"""
    categories_data = {
        "Consulting": [
            "Business Consulting", "IT Consulting", "Legal Consulting"
        ],
        "Healthcare": [
            "General Practitioner", "Dentist", "Physiotherapy", "Psychology"
        ],
        "Education": [
            "Tutoring", "Language Learning", "Coding Bootcamps", "Art Classes"
        ],
        "Financial Services": [
            "Accounting", "Financial Advising", "Tax Preparation"
        ],
        "Real Estate": [
            "Buying & Selling", "Rentals", "Property Management"
        ],
        "Food & Beverages": [
            "Catering", "Meal Delivery", "Personal Chef"
        ],
        "Events & Entertainment": [
            "Event Planning", "DJ Services", "Wedding Planning"
        ],
        "Travel & Tourism": [
            "Travel Agency", "Tour Guiding", "Accommodation Services"
        ],
        "Automotive Services": [
            "Car Repair", "Car Wash", "Tire Services", "Oil Change"
        ],
        "Beauty & Wellness": [
            "Hairdressing", "Massage Therapy", "Spa Services"
        ],
        "Sports & Recreation": [
            "Personal Training", "Sports Coaching", "Yoga Classes"
        ],
        "Home Services": [
            "Cleaning", "Landscaping", "Home Repair", "Pest Control"
        ],
        "IT & Electronics": [
            "Computer Repair", "Data Recovery", "Mobile Phone Repair"
        ],
        "Marketing & Advertising": [
            "SEO Services", "Social Media Marketing", "Content Creation"
        ],
        "Transportation & Logistics": [
            "Courier Services", "Moving Services", "Storage Services"
        ],
        "Other": [
            "Other"
        ]
    }
    
    for category_name, subcategories in categories_data.items():
        # Create category if it doesn't exist
        category = ServiceCategory.query.filter_by(name=category_name).first()
        if not category:
            category = ServiceCategory(name=category_name)
            db.session.add(category)
            db.session.flush()  # Flush to get the ID
            
        # Create subcategories
        for subcategory_name in subcategories:
            subcategory = ServiceSubcategory.query.filter_by(
                name=subcategory_name, 
                category_id=category.id
            ).first()
            if not subcategory:
                subcategory = ServiceSubcategory(
                    name=subcategory_name,
                    category_id=category.id
                )
                db.session.add(subcategory)

def run_seed():
    """Run all seeding functions"""
    app = create_app()
    with app.app_context():
        print("Starting database seeding...")
        
        # Seed categories
        print("Seeding product categories...")
        seed_product_categories()
        
        print("Seeding service categories...")
        seed_service_categories()
        
        # Commit all changes
        db.session.commit()
        print("Database seeding completed successfully!")

if __name__ == '__main__':
    run_seed()
