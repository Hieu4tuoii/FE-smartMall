import { getPublicProductVersionDetail, getRelatedPublicProductVersions } from "@/services/productService";
import type { ProductVersionDetailResponse, ProductVersionResponse } from "@/types/ProductVersion";
import ProductVersionDetail from "./ProductVersionDetail";

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const [detail, related]: [ProductVersionDetailResponse, ProductVersionResponse[]] = await Promise.all([
    getPublicProductVersionDetail(slug),
    getRelatedPublicProductVersions(slug),
  ]);

  return (
    <ProductVersionDetail detail={detail} related={related} />
  );
}




