import { Suspense } from "react";
import ProductsPage from "@/components/tagged";

export default function PageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsPage />
    </Suspense>
  );
}
