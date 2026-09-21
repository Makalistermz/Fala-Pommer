import { Outlet } from "react-router";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

function RecaptchaLayout() {
    return (
        <GoogleReCaptchaProvider
            reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
        >
            <Outlet />
        </GoogleReCaptchaProvider>
    );
}

export default RecaptchaLayout