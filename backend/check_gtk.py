import sys
try:
    from weasyprint import HTML
    print("SUCCESS: WeasyPrint imported successfully.")
except OSError as e:
    print(f"FAILURE: {e}")
except Exception as e:
    print(f"ERROR: {e}")
