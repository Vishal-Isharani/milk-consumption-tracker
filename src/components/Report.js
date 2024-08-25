// src/components/Report.js
import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { ClipLoader } from "react-spinners";
import { PlusIcon } from "@heroicons/react/24/solid";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { ArrowDownIcon } from "@heroicons/react/24/solid";
import { ArrowUpIcon } from "@heroicons/react/24/solid";

export default function Report() {
  const [price, setPrice] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [sortBy, setSortBy] = useState("quantity");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "price"));
        querySnapshot.forEach((doc) => {
          setPrice(doc.data().price);
        });
      } catch (error) {
        console.error("Error fetching price:", error);
      }
    };
    fetchPrice();
  }, []);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "milkConsumption"),
          where("date", ">=", `${selectedMonth}-01`),
          where("date", "<=", `${selectedMonth}-31`),
          orderBy(sortBy, sortOrder),
        );
        const querySnapshot = await getDocs(q);
        let totalQty = 0;
        const recordsList = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          data.price = price;
          data.dateString = new Date(data.date).toDateString();
          data.dateString = data.dateString.slice(
            0,
            data.dateString.length - 5,
          );
          totalQty += data.quantity;
          recordsList.push(data);
        });
        setReportData(recordsList);
        setTotalQuantity(totalQty);
        setTotalCost(totalQty * price);
      } catch (error) {
        console.error("Error fetching records:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [selectedMonth, price, sortBy, sortOrder]);

  const downloadReport = () => {
    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `milk_report_${selectedMonth}.xlsx`);
  };

  const setSorting = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  return (
    <div className="max-w-lg mx-auto p-4 sm:max-w-full">
      <h1 className="text-3xl font-bold text-center mb-6 sm:text-2xl">
        Monthly Milk Consumption Report
      </h1>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 sm:text-xs">
          Select Month:
        </label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="mt-1 p-2 border rounded w-full sm:text-base"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <ClipLoader color={"#3b82f6"} loading={loading} size={50} />
        </div>
      ) : reportData.length > 0 ? (
        <div className="space-y-4">
          <div className="mt-4 flex-col">
            <p className="text-xl font-semibold sm:text-lg">
              Total Quantity: {totalQuantity} liters
            </p>
            <p className="text-xl font-semibold sm:text-lg">
              Total Cost: ₹{totalCost}
            </p>
          </div>

          <div
            className="flex cursor-pointer"
            style={{ justifyContent: "flex-end", marginTop: 0 }}
          >
            <Link to="/" className="block text-blue-500 sm:text-base">
              <PlusIcon style={{ width: 30, margin: "0 10px" }} />
            </Link>

            <button
              onClick={downloadReport}
              className="text-blue-500 sm:text-base"
              disabled={loading || !reportData.length}
            >
              <ArrowDownTrayIcon style={{ width: 30, margin: "0 10px" }} />
            </button>
          </div>

          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 text-sm sm:text-xs">
                  <div className="flex justify-center cursor-pointer">
                    Date
                    {sortOrder === "asc" ? (
                      <ArrowDownIcon
                        style={{ width: 20 }}
                        onClick={() => setSorting("date", "desc")}
                      />
                    ) : (
                      <ArrowUpIcon
                        style={{ width: 20 }}
                        onClick={() => setSorting("date", "asc")}
                      />
                    )}
                  </div>
                </th>

                <th className="py-2 text-sm sm:text-xs">
                  <div className="flex justify-center cursor-pointer">
                    Quantity (liters)
                    {sortOrder === "asc" ? (
                      <ArrowDownIcon
                        style={{ width: 20 }}
                        onClick={() => setSorting("quantity", "desc")}
                      />
                    ) : (
                      <ArrowUpIcon
                        style={{ width: 20 }}
                        onClick={() => setSorting("quantity", "asc")}
                      />
                    )}
                  </div>
                </th>
                <th className="py-2 text-sm text-center sm:text-xs">
                  Price (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((data, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 text-sm sm:text-xs text-center">
                    {data.dateString}
                  </td>
                  <td className="py-2 text-sm sm:text-xs text-center">
                    {data.quantity}
                  </td>
                  <td className="py-2 text-sm sm:text-xs text-center">
                    {data.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 sm:text-base">
          No data available for this month.
        </p>
      )}
    </div>
  );
}
