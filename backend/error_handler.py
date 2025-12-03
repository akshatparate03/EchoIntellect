"""
Custom Error Handler for EchoIntellect Backend
Handles all HTTP error codes with user-friendly Hindi/Hinglish messages
"""

from typing import Dict, Optional

def get_error_message(status_code: int, model_name: str = "", custom_msg: str = "") -> Dict[str, str]:
    """
    Returns appropriate error message based on HTTP status code
    
    Args:
        status_code: HTTP status code
        model_name: Name of the AI model (optional)
        custom_msg: Custom error message (optional)
    
    Returns:
        Dictionary with error text
    """
    
    model_display = f" ({model_name})" if model_name else ""
    
    # Client-Side Errors (4xx)
    error_messages = {
        400: f"Error:- Galat request bheja gaya hai {model_display} ko. Kripya apna input check karke dobara try kare.",
        
        401: f"Error:- Authentication fail ho gaya {model_display} ka. API key ya credentials galat ho sakta hai.",
        
        403: f"Error:- Aapko {model_display} dwaara is resource ko access karne ki permission nahi hai.",
        
        404: f"Error:- Requested resource {model_display} ko nahi mila. API endpoint ya URL galat ho sakta hai.",
        
        405: f"Error:- Ye HTTP method {model_display} ke liye allowed nahi hai. Kripya sahi method use kare.",
        
        406: f"Error:- {model_display} ka server aapke Accept header ke according response nahi de sakta.",
        
        408: f"Error:- Request timeout ho gaya {model_display} ka. Server ne time par respond nahi kiya.",
        
        409: f"Error:- Resource conflict ho gaya hai {model_display} ka. Kuch data already exist kar sakta hai.",
        
        413: f"Error:- Request bahut bada hai {model_display} ke liye. Kam data bhej kar try kare.",
        
        429: f"Error:- Bahut zyada requests aa chuki hai {model_display} ko. Thodi der baad try kare (Rate limit exceed).",
        
        # Server-Side Errors (5xx)
        500: f"Error:- {model_display} ke server me internal error aaya hai. Kripya thodi der baad try kare.",
        
        501: f"Error:- Ye feature abhi implement nahi hua hai {model_display} me.",
        
        502: f"Error:- Gateway error from {model_display}. Upstream server se galat response mila.",
        
        503: f"Error:- Service temporarily unavailable hai {model_display} ke liye. Server overload ya maintenance me ho sakta hai.",
        
        504: f"Error:- Gateway timeout from {model_display}. Upstream server ne time par response nahi diya."
    }
    
    # Default error message
    if status_code not in error_messages:
        if 400 <= status_code < 500:
            error_text = f"Error:- Client error ({status_code}){model_display}. Request me kuch problem hai."
        elif 500 <= status_code < 600:
            error_text = f"Error:- Server error ({status_code}){model_display}. Thodi der baad try kare."
        else:
            error_text = f"Error:- Unknown error ({status_code}){model_display}. Kripya dobara try kare."
    else:
        error_text = error_messages[status_code]
    
    # Add custom message if provided
    if custom_msg:
        error_text += f"\n\nDetails: {custom_msg}"
    
    return {"text": error_text}


def handle_api_exception(e: Exception, model_name: str = "") -> Dict[str, str]:
    """
    Handle generic API exceptions
    
    Args:
        e: Exception object
        model_name: Name of the AI model
    
    Returns:
        Dictionary with error text
    """
    model_display = f" ({model_name})" if model_name else ""
    error_type = type(e).__name__
    error_msg = str(e)
    
    # Connection errors
    if "ConnectionError" in error_type or "connection" in error_msg.lower():
        return {"text": f"Error:- Internet connection problem for {model_display}. Network check kar ke try kare."}
    
    # Timeout errors
    if "Timeout" in error_type or "timeout" in error_msg.lower():
        return {"text": f"Error:- Request timeout ho gaya {model_display} ka. Server respond nahi kar raha. Thodi der baad try kare."}
    
    # JSON decode errors
    if "JSONDecodeError" in error_type or "json" in error_msg.lower():
        return {"text": f"Error:- Response parse nahi ho paya {model_display} ka. Server ne invalid data bheja."}
    
    # Key errors (missing data in response)
    if "KeyError" in error_type:
        return {"text": f"Error:- Response me expected data nahi mila {model_display} ko. API structure change ho sakta hai."}
    
    # Generic exception
    return {"text": f"Error:- Unexpected error from {model_display}: {error_type}\n\nKripya thodi der baad try kare ya admin ko inform kare."}


def handle_model_specific_error(model: str, error_type: str, details: str = "") -> Dict[str, str]:
    """
    Handle model-specific errors
    
    Args:
        model: Model name
        error_type: Type of error (api_key, quota, etc.)
        details: Additional error details
    
    Returns:
        Dictionary with error text
    """
    model = model.upper()
    
    if error_type == "api_key_missing":
        return {"text": f"Error:- {model} API key environment variable me nahi hai (.env file check kare)."}
    
    if error_type == "quota_exceeded":
        return {"text": f"Error:- {model} ka quota khatam ho gaya hai. Limit reset hone ka wait kare."}
    
    if error_type == "invalid_response":
        return {"text": f"Error:- {model} ne invalid response bheja hai. Service me problem ho sakti hai."}
    
    if error_type == "no_response":
        return {"text": f"Error:- {model} se koi response nahi aaya. Service down ho sakti hai."}
    
    # Generic model error
    msg = f"Error:- {model} model me error: {details}" if details else f"⚠️ {model} model me error aaya hai."
    return {"text": msg}