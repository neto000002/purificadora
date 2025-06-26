import { useEffect, useState } from "react";
import { Pencil, Check } from "lucide-react";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [newQuantity, setNewQuantity] = useState(0);

  const desiredOrder = [
  "azucar",
  "cafe",
  "cepillos",
  "cloro",
  "esponjas",
  "fabuloso",
  "garrafones",
  "gergas",
  "guantes",
  "jabon",
  "kolaloka",
  "lainers",
  "salvo",
  "sellos",
  "tapas ciel",
  "tapas bonafont",
  "tapas presion"
];


  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/inventory");
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error("Error al cargar el inventario:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const handleEdit = (item) => {
    setEditing(item.name);
    setNewQuantity(item.quantity);
  };

  const handleSave = async (name) => {
    try {
      const res = await fetch(`http://localhost:5000/api/inventory/${name}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      const updated = await res.json();
      setItems((prev) =>
        prev.map((item) => (item.name === name ? updated : item))
      );
      setEditing(null);
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  if (loading)
    return (
      <p className="text-center text-blue-600 font-semibold mt-6">
        Cargando inventario...
      </p>
    );

  const sortedItems = desiredOrder
    .map((name) =>
      items.find((item) => item.name.toLowerCase() === name.toLowerCase())
    )
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-200 py-10 px-4 flex justify-center items-start">
      <div className="w-full max-w-4xl bg-white p-8 rounded-3xl shadow-xl mx-auto">
        <h2 className="text-3xl font-extrabold text-blue-900 mb-8 border-b border-blue-300 pb-3 select-none text-center">
          📦 Inventario General
        </h2>

        <table
          className="border-collapse border border-gray-300 rounded-lg overflow-hidden"
          style={{ width: "600px", margin: "0 auto" }}
        >
          <thead className="bg-blue-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Producto</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Cantidad</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-blue-50 transition-colors duration-200"
                role="group"
                aria-label={`Inventario de ${item.name}`}
              >
                <td className="border border-gray-300 px-4 py-3 capitalize font-semibold text-gray-800 max-w-xs truncate">
                  {item.name}
                </td>

                <td className="border border-gray-300 px-4 py-3 text-right font-mono text-xl text-blue-700">
                  {editing === item.name ? (
                    <input
                      type="number"
                      min={0}
                      className="w-full border border-blue-300 rounded-md px-3 py-1 text-right font-mono text-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(Number(e.target.value))}
                    />
                  ) : (
                    item.quantity
                  )}
                </td>

                <td className="border border-gray-300 px-4 py-3 text-center">
                  {editing === item.name ? (
                    <button
                      onClick={() => handleSave(item.name)}
                      aria-label="Guardar cantidad"
                      title="Guardar cantidad"
                      className="bg-green-600 hover:bg-green-700 focus:ring-green-400 focus:outline-none text-white p-2 rounded-full transition"
                    >
                      <Check size={20} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEdit(item)}
                      aria-label="Editar cantidad"
                      title="Editar cantidad"
                      className="text-blue-600 hover:text-blue-800 focus:outline-none p-2 rounded-full transition"
                    >
                      <Pencil size={20} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
