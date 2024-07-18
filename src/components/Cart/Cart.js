import React, { useContext, useState } from "react";
import jsPDF from "jspdf";
import axios from "axios";
import Modal from "../UI/Modal";
import CartItem from "./CartItem";
import classes from "./Cart.module.css";
import CartContext from "../../store/cart-context";
import Checkout from "./Checkout";

const Cart = (props) => {
  const [isCheckout, setIsCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [didSubmit, setDidSubmit] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  // const [order_itemsDetails, setOrder_itemsDetails] = useState(null);
  const cartCtx = useContext(CartContext);

  const totalAmount = `Rs. ${cartCtx.totalAmount.toFixed(2)}`;
  const hasItems = cartCtx.items.length > 0;

  const cartItemRemoveHandler = (id) => {
    cartCtx.removeItem(id);
  };

  const cartItemAddHandler = (item) => {
    cartCtx.addItem({ ...item, amount: 1 });
  };

  const orderHandler = () => {
    setIsCheckout(true);
  };

  const generateOrderId = () => {
    const timestamp = Date.now();
    const randomPortion = Math.floor(Math.random() * 1000);
    return `${timestamp}${randomPortion}`;
  };

  const submitOrderHandler = async (userData) => {
    const orderId = generateOrderId();
    const now = new Date();
    const numberOfItems = cartCtx.items.reduce((total, item) => total + item.amount, 0);
    const orderDetails = {
      orderId,
      name: userData.name,
      phoneNumber: userData.mobileNumber,
      roomNumber: userData.roomNumber,
      time: `${now.getHours()}:${now.getMinutes()}`,
      date: `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`,
      totalAmount,
      numberOfItems,
      items: cartCtx.items.map(item => ({ name: item.name, amount: item.amount, price: item.price }))
    };

    // const order_itemsDetails = {
    //   orderId, 
    //   itemName: cartCtx.
    //   amount,
    //   price,
    //   items: cartCtx.items.map(item => ({ name: item.name, amount: item.amount, price: item.price }))
    // };

    setIsSubmitting(true);
    try {
      // Save order to Firebase (existing functionality)
      await fetch("https://react-http-94dfa-default-rtdb.firebaseio.com/orders.json", {
        method: "POST",
        body: JSON.stringify({
          orderId,
          user: userData,
          orderedItems: cartCtx.items,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      // Save order to SQLite database (new functionality)
      await axios.post('http://localhost:5000/orders', orderDetails);
      // await axios.post('http://localhost:5000/order_items', order_itemsDetails);
  
      setIsSubmitting(false);
      setDidSubmit(true);
      setOrderDetails(orderDetails);
      // setOrder_itemsDetails(order_itemsDetails);
      cartCtx.clearCart();
    } catch (error) {
      console.error("Failed to submit order:", error);
      setIsSubmitting(false);
    }
        

      
  };

  const generatePdf = () => {
    const doc = new jsPDF();
    const { orderId, name, phoneNumber, roomNumber, time, date, totalAmount, numberOfItems, items } = orderDetails;

    doc.text(20, 20, `Order Bill`);
    doc.text(20, 30, `Order ID: ${orderId}`);
    doc.text(20, 40, `Name: ${name}`);
    doc.text(20, 50, `Phone Number: ${phoneNumber}`);
    doc.text(20, 60, `Room Number: ${roomNumber}`);
    doc.text(20, 70, `Time: ${time}`);
    doc.text(20, 80, `Date: ${date}`);
    doc.text(20, 90, `Number of Items: ${numberOfItems}`);
    doc.text(20, 100, `Total Amount: ${totalAmount}`);
    doc.text(20, 110, `Items:`);

    

    items.forEach((item, index) => {
      doc.text(20, 120 + index * 10, `${item.name} - ${item.amount} x Rs. ${item.price.toFixed(2)} `);
    });
    
    doc.save("order-bill.pdf");



  };

  const cartItems = (
    <ul className={classes["cart-items"]}>
      {cartCtx.items.map((item) => (
        <CartItem
          key={item.id}
          name={item.name}
          amount={item.amount}
          price={item.price}
          onRemove={cartItemRemoveHandler.bind(null, item.id)}
          onAdd={cartItemAddHandler.bind(null, item)}
        />
      ))}
    </ul>
  );

  const modalActions = (
    <div className={classes.actions}>
      <button className={classes["button--alt"]} onClick={props.onClose}>
        Close
      </button>
      {hasItems && (
        <button className={classes.button} onClick={orderHandler}>
          Order
        </button>
      )}
    </div>
  );

  const cartModalContent = (
    <React.Fragment>
      {!isCheckout && cartItems}
      <div className={classes.total}>
        <span>Total Amount</span>
        <span>{totalAmount}</span>
      </div>
      {isCheckout && <Checkout onConfirm={submitOrderHandler} onCancel={props.onClose} />}
      {!isCheckout && modalActions}
    </React.Fragment>
  );

  const didSubmitModalContent = (
    <React.Fragment>
      <p>Successfully sent the order!</p>
      {orderDetails && (
        <div>
          <h2>Order Bill</h2>
          <ul>
            <li>Name: {orderDetails.name}</li>
            <li>Phone Number: {orderDetails.phoneNumber}</li>
            <li>Room Number: {orderDetails.roomNumber}</li>
            <li>Order ID: {orderDetails.orderId}</li>
            <li>Time: {orderDetails.time}</li>
            <li>Date: {orderDetails.date}</li>
            <li>Number of Items: {orderDetails.numberOfItems}</li>
            <li>Total Amount: {orderDetails.totalAmount}</li>
            <li>Items:</li>
            <ul>
            {orderDetails.items.map((item, index) => (
              <li key={index}>{item.name} - {item.amount} x Rs. {item.price.toFixed(2)} </li>

             ))} 
            </ul>
          </ul>
             



          <button onClick={generatePdf} className={classes.button}>
            Download Bill
          </button>
        </div>
      )}
      <div className={classes.actions}>
        <button className={classes.button} onClick={props.onClose}>
          Close
        </button>
      </div>
    </React.Fragment>
  );

  return (
    <Modal onClose={props.onClose}>
      {!isSubmitting && !didSubmit && cartModalContent}
      {isSubmitting && <p>Sending order data...</p>}
      {!isSubmitting && didSubmit && didSubmitModalContent}
    </Modal>
  );
};

export default Cart;

