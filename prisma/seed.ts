import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({
    data: [
      {
        name: "Basic Tee",
        description: "Cotton 100%, form regular.",
        price: 199000,
        image: "https://picsum.photos/seed/tee/600/800",
      },
      {
        name: "Oversize Hoodie",
        description: "Nỉ bông dày, ấm, bo tay.",
        price: 399000,
        image: "https://picsum.photos/seed/hoodie/600/800",
      },
      {
        name: "Denim Jacket",
        description: "Jeans xanh đậm, unisex.",
        price: 499000,
        image: "https://picsum.photos/seed/denim/600/800",
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(() => console.log("Seeded"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
