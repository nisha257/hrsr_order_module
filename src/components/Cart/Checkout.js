import classes from './Checkout.module.css';
import { useRef, useState } from 'react';

const isEmpty = value => value.trim() === "";

const Checkout = (props) => {
  const [formInputValidity, setFormInputValidity] = useState({
    name: true,
    mobileNumber: true,
    roomNumber: true,
  });

  const nameInputRef = useRef();
  const mobileNumberInputRef = useRef();
  const roomNumberInputRef = useRef();

  const confirmHandler = (event) => {
    event.preventDefault();

    const enteredName = nameInputRef.current.value;
    const enteredMobileNumber = mobileNumberInputRef.current.value;
    const enteredRoomNumber = roomNumberInputRef.current.value;

    const enteredNameIsValid = !isEmpty(enteredName);
    const enteredMobileNumberIsValid = !isEmpty(enteredMobileNumber);
    const enteredRoomNumberIsValid = !isEmpty(enteredRoomNumber);

    setFormInputValidity({
      name: enteredNameIsValid,
      mobileNumber: enteredMobileNumberIsValid,
      roomNumber: enteredRoomNumberIsValid,
    });

    const formIsValid = enteredNameIsValid && enteredMobileNumberIsValid && enteredRoomNumberIsValid;

    if (!formIsValid) {
      return;
    }

    props.onConfirm({
      name: enteredName,
      mobileNumber: enteredMobileNumber,
      roomNumber: enteredRoomNumber,
    });

    // Clearing the inputs after submission can be optional based on the user experience requirements
    nameInputRef.current.value = "";
    mobileNumberInputRef.current.value = "";
    roomNumberInputRef.current.value = "";
  };

  const nameControlClasses = `${classes.control} ${formInputValidity.name ? '' : classes.invalid}`;
  const mobileNumberControlClasses = `${classes.control} ${formInputValidity.mobileNumber ? '' : classes.invalid}`;
  const roomNumberControlClasses = `${classes.control} ${formInputValidity.roomNumber ? '' : classes.invalid}`;

  return (
    <form className={classes.form} onSubmit={confirmHandler}>
      <div className={nameControlClasses}>
        <label htmlFor='name'>Your Name</label>
        <input ref={nameInputRef} type='text' id='name' />
        {!formInputValidity.name && <p>Please enter a valid name</p>}
      </div>
      <div className={mobileNumberControlClasses}>
        <label htmlFor='mobileNumber'>Mobile Number</label>
        <input ref={mobileNumberInputRef} type='text' id='mobileNumber' />
        {!formInputValidity.mobileNumber && <p>Please enter a valid mobile number</p>}
      </div>
      <div className={roomNumberControlClasses}>
        <label htmlFor='roomNumber'>Room Number</label>
        <input ref={roomNumberInputRef} type='text' id='roomNumber' />
        {!formInputValidity.roomNumber && <p>Please enter a valid room number</p>}
      </div>
      <div className={classes.actions}>
        <button type='button' onClick={props.onCancel}>
          Cancel
        </button>
        <button className={classes.submit}>Confirm</button>
      </div>
    </form>
  );
};

export default Checkout;
