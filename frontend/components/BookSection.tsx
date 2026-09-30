'use client';

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useCart } from '../context/CartContext';

// Forward-ref wrapper: readOnly so the keyboard can't type directly,
// click opens the calendar, and DatePicker can attach its own ref.
const DateInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => (
  <input
    {...props}
    ref={ref}
    readOnly
    className="form-control"
    style={{ cursor: 'pointer', backgroundColor: 'white' }}
  />
));
DateInput.displayName = 'DateInput';

// Block time slots that have already passed today.
function filterPassedTime(time: Date): boolean {
  return new Date().getTime() < time.getTime();
}

export default function BookSection() {
  const { t, language } = useCart();
  const [persons, setPersons] = useState('');
  const [bookingDate, setBookingDate] = useState<Date | null>(null);

  return (
    <section className="book_section layout_padding" id="book">
      <div className="container">
        <div className="heading_container">
          <h2>{t.book_title}</h2>
        </div>
        <div className="row">
          <div className="col-md-6">
            <div className="form_container">
              <form action="">
                <div>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={t.name_placeholder}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={t.phone_placeholder}
                  />
                </div>
                <div>
                  <input
                    type="email"
                    className="form-control"
                    placeholder={t.email_placeholder}
                  />
                </div>
                <div>
                  <select
                    key={language}
                    className="form-control"
                    value={persons}
                    onChange={(e) => setPersons(e.target.value)}
                  >
                    <option value="" disabled>
                      {t.persons_placeholder}
                    </option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      color: 'white',
                      fontSize: '14px',
                      marginBottom: '4px',
                    }}
                  >
                    {t.booking_datetime}
                  </label>
                  <DatePicker
                    key={language}
                    selected={bookingDate}
                    onChange={(date: Date | null) => setBookingDate(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy HH:mm"
                    minDate={new Date()}
                    filterTime={filterPassedTime}
                    placeholderText={t.booking_datetime}
                    customInput={<DateInput />}
                  />
                </div>
                <div className="btn_box">
                  <button type="submit">{t.book_now}</button>
                </div>
              </form>
            </div>
          </div>
          <div className="col-md-6">
            <div className="map_container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2978.1286071444054!2d44.783333!3d41.716667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDQzJzAwLjAiTiA0NMKwNDcnMDAuMCJF!5e0!3m2!1sen!2sge!4v1631234567890!5m2!1sen!2sge"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '15px' }}
                allowFullScreen={true}
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
