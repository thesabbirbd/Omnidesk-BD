import os
import glob
import re

modal_files = glob.glob('frontend/src/components/**/*Modal.jsx', recursive=True)

for file_path in modal_files:
    with open(file_path, 'r') as f:
        content = f.read()
    
    # 1. Wrapper padding: replace p-4 or p-6 with p-0 sm:p-4 (but be careful not to match internal p-4)
    # The wrapper is usually "fixed inset-0 ... p-4 ..."
    content = re.sub(r'(fixed inset-0[^"]*) p-[46]( sm:p-[46])?', r'\1 p-0 sm:p-6', content)
    
    # 2. Inner div: rounded-3xl or rounded-[32px] -> rounded-none sm:rounded-3xl
    content = re.sub(r'rounded-(?:3xl|2xl|xl|\[32px\])', r'rounded-none sm:rounded-3xl', content)
    
    # 3. Inner div: max-h-[88vh] -> h-full sm:h-auto sm:max-h-[88vh]
    content = re.sub(r'max-h-\[[a-zA-Z0-9]+\]', r'h-full sm:h-auto sm:\g<0>', content)
    
    # If it doesn't have max-h-, we might need to add h-full manually to the relative w-full element.
    # Let's target the inner wrapper directly. It always comes after the fixed wrapper.
    # We can just look for "relative w-full max-w-" or "w-full max-w-" 
    content = re.sub(r'(w-full max-w-[a-z0-9-]+(?!.*h-full))', r'\1 h-full sm:h-auto max-h-screen sm:max-h-[90vh]', content)

    # 4. Make sure close buttons have some top padding on mobile due to safe-area
    # Close button is usually "absolute top-4 right-4" or similar
    content = re.sub(r'absolute top-[0-9] right-[0-9]', r'fixed sm:absolute top-[env(safe-area-inset-top,1rem)] sm:top-4 right-4 z-50', content)
    content = re.sub(r'absolute top-5 right-5', r'fixed sm:absolute top-[env(safe-area-inset-top,1.25rem)] sm:top-5 right-5 z-50', content)

    with open(file_path, 'w') as f:
        f.write(content)

print("Modals patched.")
