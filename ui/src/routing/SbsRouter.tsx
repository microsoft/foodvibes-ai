import App from "@sbssrc/App";
import { Product } from "@sbssrc/features/product/Product";
import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "./error-page";

export const SbsRouter = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "",
                // element: <FvHome />,
                element: <Product />,
            },
            {
                path: "product",
                element: <Product />,
            },
        ],
    },
]);
