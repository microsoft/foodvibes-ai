import App from "@sbssrc/App";
import { Session } from "@sbssrc/features/session/Sesseion";
import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "./Error-page";

export const SbsRouter = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "",
                // element: <FvHome />,
                element: <Session />,
            },
            {
                path: "Session",
                element: <Session />,
            },
        ],
    },
]);
