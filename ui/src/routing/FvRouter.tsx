import App from "@foodvibes/App";
import { Product } from "@foodvibes/features/product/Product";
import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "./error-page";

export const FvRouter = createBrowserRouter([
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
