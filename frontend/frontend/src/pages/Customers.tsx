import { useEffect } from "react";
import api from "../services/api";

function Customers() {
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await api.get("/customers");

        console.log("API CONNECTED ✅");
        console.log(response.data);
      } catch (error) {
        console.error("API CONNECTION FAILED ❌", error);
      }
    };

    testConnection();
  }, []);

  return <h1>Customers</h1>;
}

export default Customers;