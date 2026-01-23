import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { fetchBinItems, restoreBinItem, permanentlyDeleteBinItem } from "../../../api/userApi";
import Loader from "../../../components/common/Loader/Loader";
import "./RecycleBin.css";

const RecycleBin = () => {
    const [binItems, setBinItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadBinItems();
    }, []);

    const loadBinItems = async () => {
        setLoading(true);
        try {
            const data = await fetchBinItems();
            // Ensure data is an array, handle if wrapped in an object
            setBinItems(Array.isArray(data) ? data : data.items || []);
            setError(null);
        } catch (err) {
            console.error("Error fetching bin items:", err);
            setError("Failed to load deleted items.");
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = (id) => {
        Swal.fire({
            title: "Restore Item?",
            text: "This item will be moved back to its original list.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#108a5d",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, restore it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await restoreBinItem(id);
                    Swal.fire("Restored!", "The item has been restored.", "success");
                    loadBinItems(); // Refresh list
                } catch (err) {
                    Swal.fire("Error!", err.message || "Failed to restore item.", "error");
                }
            }
        });
    };

    const handleDeleteForever = (id) => {
        Swal.fire({
            title: "Permanently Delete?",
            text: "You won't be able to revert this! This item will be gone forever.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it forever!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await permanentlyDeleteBinItem(id);
                    Swal.fire("Deleted!", "The item has been permanently deleted.", "success");
                    loadBinItems(); // Refresh list
                } catch (err) {
                    Swal.fire("Error!", err.message || "Failed to delete item.", "error");
                }
            }
        });
    };

    if (loading) return <Loader />;

    if (error) {
        return (
            <div className="approve-users-page">
                <div className="error-message">
                    <p>{error}</p>
                    <button className="retry-btn" onClick={loadBinItems}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="recycle-bin-page">
            <h2 className="page-title">Recycle Bin</h2>

            <div className="recycle-bin-card">
                <div className="card-header">Deleted Items</div>

                <div className="table-container">
                    <table className="bin-table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Name</th>
                                <th>Deleted Date</th>
                                <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {binItems.length === 0 ? (
                                <tr>
                                    <td colSpan="4">
                                        <div className="empty-state">
                                            <i className="bi bi-trash"></i>
                                            <p>Recycle Bin is empty</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                binItems.map((item) => (
                                    <tr key={item._id || item.id}>
                                        <td>
                                            <span className={`item-type ${item.itemType?.toLowerCase()}`}>
                                                {item.itemType || "Unknown"}
                                            </span>
                                        </td>
                                        <td className="item-name">{item.itemRefName || item.data?.name || "N/A"}</td>
                                        <td className="deleted-date">
                                            {item.createdAt
                                                ? new Date(item.createdAt).toLocaleDateString("en-US", {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })
                                                : "-"
                                            }
                                        </td>
                                        <td className="action-icons">
                                            <button
                                                className="icon-btn restore-btn"
                                                title="Restore"
                                                onClick={() => handleRestore(item._id || item.id)}
                                            >
                                                <i className="bi bi-arrow-counterclockwise"></i>
                                            </button>
                                            <button
                                                className="icon-btn delete-btn"
                                                title="Delete Forever"
                                                onClick={() => handleDeleteForever(item._id || item.id)}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RecycleBin;
