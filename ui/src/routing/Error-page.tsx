import { ErrorResponseImpl } from "@remix-run/router/dist/utils";
import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
    const error: ErrorResponseImpl = useRouteError() as ErrorResponseImpl;
    console.error(error);

    return (
        <div id="error-page">
            <h1>Error!</h1>
            <div>Sorry, an unexpected error has occurred.</div>
            <ul>
                <li>{`${error?.status}`}</li>
                <li>{`${error?.statusText}`}</li>
                <li>{`${error?.data}`}</li>
            </ul>
            <div>
                Return to <a href="/">Home</a>
            </div>
        </div>
    );
}
