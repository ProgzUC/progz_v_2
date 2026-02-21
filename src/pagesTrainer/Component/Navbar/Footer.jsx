import React from 'react'
import './Footer.css'
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube, FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  {/*if screen height is less than 90vh footer is fixed at the bottom */}
  if (window.innerHeight < 90) {
    document.querySelector('.footer').style.position = 'fixed';
    document.querySelector('.footer').style.bottom = '0';
  }
  
  return (
    <div className='footer'>
      <div className="footer-container">
        <p>Made with ❤️ by Urbancode. All rights reserved ©2025.</p>
       
        {/*Social media icons*/}
        <div className="social-icons d-flex gap-3 justify-content-center ">
          <a href="https://www.facebook.com/profile.php?id=61563183054002#" className="text-success"><FaFacebook /></a>
          <a href="https://twitter.com/urbancode" className="text-success"><FaTwitter /></a>
          <a href="https://www.linkedin.com/company/99156099/admin/dashboard/" className="text-success"><FaLinkedin /></a>
          <a href="https://www.instagram.com/urbancode_edutech/" className="text-success"><FaInstagram /></a>
          <a href="https://www.youtube.com/channel/UC7ngZ5r2ov-qoXJRjaXJGKA" className="text-success"><FaYoutube /></a>
          <a href="https://wa.me/919429694123?text=Hello%20Team%20ProgZ" className="text-success"><FaWhatsapp /></a>
        </div>

      </div>
    </div>
  )
}

export default Footer