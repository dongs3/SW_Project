import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Register.css';
import Swal from 'sweetalert2';
import { errorMessage, successMessage } from '../utils/SweetAlertEvent';
import axios from 'axios';

const HOST = process.env.REACT_APP_HOST;
const PORT = process.env.REACT_APP_PORT;

function Register() {
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [isActive, setIsActive] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      errorMessage('비밀번호를 다시 입력하세요!');
      document.getElementById('register_password2').value = '';
      return;
    }
    try {
      await axios.post(`${HOST}:${PORT}/auth/register`, registerData);
      successMessage(`${registerData.email}님 가입을 환영합니다!`);
      setIsActive(false);
      document.getElementById('register_email').value = '';
      document.getElementById('register_name').value = '';
      document.getElementById('register_password').value = '';
      document.getElementById('register_password2').value = '';
    } catch (e) {
      errorMessage(`형식이 잘못되었습니다.<br><br>1. 중복 금지 + 이메일 형식<br>2. 이름 2글자 이상<br>3. 비밀번호 공백 금지 입니다.`);
      document.getElementById('register_email').value = '';
      document.getElementById('register_name').value = '';
      document.getElementById('register_password').value = '';
      document.getElementById('register_password2').value = '';
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${HOST}:${PORT}/auth/login`, loginData);
      Swal.fire({
        title: '알림',
        icon: 'success',
        html: `환영합니다!`,
        showCancelButton: false,
        confirmButtonText: '확인',
      }).then(() => {
        localStorage.clear();
        const now = new Date();
        const nextTime = new Date(now.setHours(now.getHours() + 1));
        const obj = {
          time: nextTime.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }),
          expire: nextTime.getTime()
        }
        localStorage.setItem(loginData.email, JSON.stringify(obj));
        navigate("/");
      });
    } catch (e) {
      errorMessage('로그인 실패!!');
      document.getElementById('login_email').value = '';
      document.getElementById('login_password').value = '';
    }
  };

  const handleHome = async (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className={`container ${isActive ? 'active' : ''}`} id="container">
      <div className="form-container sign-up">
        <form className="register-form" onSubmit={handleRegister}>
          <h2>Create Account</h2>
          <input
            type="text"
            placeholder="Email"
            id="register_email"
            autocomplete="off"
            onChange={(e) => setRegisterData((prevState) => ({ ...prevState, email: e.target.value }))}
            required
          />
          <input
            type="text"
            placeholder="Name"
            id="register_name"
            autocomplete="off"
            onChange={(e) => setRegisterData((prevState) => ({ ...prevState, name: e.target.value }))}
            required
          />
          <input
            type="password"
            placeholder="Password"
            id="register_password"
            onChange={(e) => setRegisterData((prevState) => ({ ...prevState, password: e.target.value }))}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            id="register_password2"
            onChange={(e) => setRegisterData((prevState) => ({ ...prevState, confirmPassword: e.target.value }))}
            required
          />
          <p>{registerData.password !== registerData.confirmPassword ? 'Passwords do not match' : ''}</p>
          <button type="submit">Sign Up</button>
        </form>
      </div>
      <div className="form-container sign-in">
        <form className="register-form" onSubmit={handleLogin}>
          <h2>Sign in</h2>
          <input
            type="email"
            placeholder="Email"
            id="login_email"
            onChange={(e) => setLoginData((prevState) => ({ ...prevState, email: e.target.value }))}
            required
          />
          <input
            type="password"
            placeholder="Password"
            id="login_password"
            onChange={(e) => setLoginData((prevState) => ({ ...prevState, password: e.target.value }))}
            required
          />
          <button type="submit">Sign In</button>
        </form>
      </div>
      <div className="toggle-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <h2>WYSIWYG Owner?</h2>
            <p>계정이 있으신가요? 그럼 로그인 해주세요~</p>
            <button type="button" onClick={() => setIsActive(false)}>
              Sign In
            </button>
          </div>
          <div className="overlay-panel overlay-right">
            <h2>Welcome!</h2>
            <p>아직 계정이 없으신가요? 그럼 회원가입 해주세요!</p>
            <button type="button" onClick={() => setIsActive(true)}>
              Sign Up
            </button>
            <p></p>
            <h2>Home?</h2>
            <p>홈 화면으로 가시겠어요? Home 을 눌러주세요..</p>
            <button type="button" onClick={handleHome}>
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;