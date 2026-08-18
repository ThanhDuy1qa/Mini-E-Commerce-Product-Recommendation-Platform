import Link from "next/link";
import { mockProducts } from "../../page";

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  // Sửa thành product.asin
  const product = mockProducts.find((p) => p.asin === resolvedParams.id);

  if (!product) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800">Product Not Found!</h1>
        <Link href="/" className="mt-4 text-blue-600 hover:underline">← Back to Home</Link>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/" className="inline-block mb-8 text-blue-600 font-semibold hover:text-blue-800 transition-colors">
        ← Back to Products
      </Link>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <img 
              src={product.image_url} 
              alt={product.title} 
              className="w-full h-[400px] md:h-[500px] object-cover"
            />
          </div>
          
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <span className="text-sm font-bold text-blue-500 uppercase tracking-widest">{product.main_cat}</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2 mb-4">{product.title}</h1>
            <p className="text-3xl font-bold text-red-600 mb-6">${product.price.toFixed(2)}</p>
            
            <div className="border-t border-b border-gray-200 py-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed mb-4">{product.description}</p>
              
              <p className="text-sm font-semibold">
                Availability: <span className={isOutOfStock ? "text-red-500" : "text-green-600"}>
                  {isOutOfStock ? "Out of Stock" : `In Stock (${product.stock} items)`}
                </span>
              </p>
            </div>
            
            <button 
              disabled={isOutOfStock}
              className={`w-full font-bold text-lg py-4 rounded-xl transition-all shadow-lg 
                ${isOutOfStock 
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed shadow-none" 
                  : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/30"}`}
            >
              {isOutOfStock ? "🚫 Out of Stock" : "🛒 Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}