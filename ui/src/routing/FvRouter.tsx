import App from "@foodvibes/App";
import { FvHome } from "@foodvibes/features/authorization/FvHome";
import { FvLogin } from "@foodvibes/features/authorization/FvLogin";
import { Geotrack } from "@foodvibes/features/geotrack/Geotrack";
import { Product } from "@foodvibes/features/product/Product";
import { ScCircle } from "@foodvibes/features/scCircle/ScCircle";
import { ScGroup } from "@foodvibes/features/scGroup/ScGroup";
import { ScUser } from "@foodvibes/features/scUser/ScUser";
import { TrackingProducts } from "@foodvibes/features/trackingProducts/TrackingProducts";
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
                element: <FvHome />,
            },
            {
                path: "product/:id?",
                element: <Product />,
            },
            {
                path: "geotrack/:id?",
                element: <Geotrack />,
            },
            {
                path: "tracking-products/:id?",
                element: <TrackingProducts />,
            },
            {
                path: "permissions/scuser",
                element: <ScUser />,
            },
            {
                path: "permissions/scgroup",
                element: <ScGroup />,
            },
            {
                path: "permissions/sccircle",
                element: <ScCircle />,
            },
            {
                path: "login",
                element: <FvLogin />,
            },
        ],
    },
]);
