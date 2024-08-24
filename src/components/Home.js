// src/components/Home.js
import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { ClipLoader } from "react-spinners";

export default function Home() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [hasPrice, setHasPrice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [changingPrice, setChangingPrice] = useState(false);
  const [quantityInputDisabled, setQuantityInputDisabled] = useState(false);

  useEffect(() => {
    const fetchDataForDate = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "milkConsumption"));
        querySnapshot.forEach((doc) => {
          if (doc.data().date === date) {
            setQuantity(doc.data().quantity);

            // disable the quantity input if a record already exists for the date
            // this is to prevent duplicate entries for the same date
            // and to avoid confusion
            // the user can still change the date to add a new record

            setQuantityInputDisabled(true);
          } else {
            setQuantity("");
            setQuantityInputDisabled(false);
          }
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchDataForDate();
  }, [date]);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "price"));
        querySnapshot.forEach((doc) => {
          setPrice(doc.data().price);
          setHasPrice(true);
        });
      } catch (error) {
        console.error("Error fetching price:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrice();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, "milkConsumption"), {
        date,
        quantity: parseFloat(quantity),
      });
      setQuantity("");
    } catch (error) {
      console.error("Error adding record:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePriceSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (hasPrice) {
        // Delete the old price entry
        const querySnapshot = await getDocs(collection(db, "price"));
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
      }
      // Add the new price
      await addDoc(collection(db, "price"), { price: parseFloat(price) });
      setHasPrice(true);
      setChangingPrice(false);
      alert("Price updated successfully.");
    } catch (error) {
      console.error("Error setting price:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 sm:max-w-full">
      <h1 className="text-3xl font-bold text-center mb-6 sm:text-2xl">
        Milk Consumption Tracker
      </h1>

      {loading ? (
        <div className="flex justify-center items-center">
          <ClipLoader color={"#3b82f6"} loading={loading} size={50} />
        </div>
      ) : (
        <>
          {!hasPrice || changingPrice ? (
            <form onSubmit={handlePriceSubmit} className="space-y-4">
              <input
                type="number"
                placeholder="Set Price (per liter)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                disabled={submitting}
                className="w-full p-2 border rounded"
              />
              <button
                type="submit"
                className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
                disabled={submitting}
              >
                {submitting ? (
                  <ClipLoader color={"#ffffff"} size={20} />
                ) : (
                  "Set Price"
                )}
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="Milk Quantity (in liters)"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  disabled={quantityInputDisabled}
                  className="w-full p-2 border rounded"
                />
                <div className="flex items-center space-x-2">
                  <label className="w-full p-2 border rounded">
                    Price (per liter):
                  </label>
                  <input
                    type="text"
                    value={price}
                    readOnly
                    className="w-full p-2 border rounded bg-gray-100"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                  disabled={submitting || quantityInputDisabled}
                >
                  {submitting ? (
                    <ClipLoader color={"#ffffff"} size={20} />
                  ) : (
                    "Add Record"
                  )}
                </button>
              </form>
              <button
                onClick={() => setChangingPrice(true)}
                className="w-full mt-4 bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
              >
                Change Price
              </button>
            </>
          )}

          <Link
            to="/report"
            className="block text-center mt-6 text-blue-500 hover:underline"
          >
            View Monthly Report
          </Link>
        </>
      )}
    </div>
  );
}
