import ProductForm from "@/components/ProductForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EditProduct({
  params,
}: {
  params: { id: string };
}) {
  const p = await prisma.product.findUnique({ where: { id: params.id } });
  if (!p) notFound();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Link
          href={`/products/${p.id}`}
          className="text-sm text-zinc-600 hover:underline"
        >
          ← Back to detail
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Edit product
        </h1>
        <p className="text-zinc-600">Cập nhật thông tin sản phẩm</p>
      </div>

      <ProductForm
        id={p.id}
        defaultValues={{
          name: p.name,
          description: p.description,
          price: Number(p.price),
          image: p.image ?? "",
        }}
      />
    </div>
  );
}
