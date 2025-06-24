<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My login page</title>
    <style>
        *{
            font-family: "poppins",sans-serif;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body{
            background: url(bgit.png);
            width: 100%;
            height: 100dvh;
            display: flex;
            align-items: center;
            background-size: cover;
            background-position: center;
        }
        .container{
            background: rgb(0, 0, 0 ,0.1);
            width: 320px;
            padding: 24px;
           
            margin: 20cm;
            border-radius: 16px;
            border: solid rgb(255, 255, 255 ,0.1);
            backdrop-filter: blur(25px);
            box-shadow: 0px 0px 30px 20px rgb(0, 0, 0 ,0.1);
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
        
        }
        .login-title{
            margin-bottom: 16px;
        }

        .input-box{
            display: flex;
            width: 100%;
            position: relative;
            margin-top: 20px;
            padding-top:20px;
        }
        .input-box input{
            width: 100%;
            padding: 10px 16px 10px 38px;
            border-radius: 99px;
            border: solid 3px transparent;
            background: rgb(255, 255, 255, 0.1);
            outline: none;
            caret-color: white;
            color: white;
            font-weight: 500;
            transition: 0.25s;
        }
        .input-box input:focus{
            border: solid rgb(255, 255, 255 ,0.25);
        }
        .input-box input::placeholder{
            color: rgb(255, 255, 255 ,0.75);
        }
        .input-box::-ms-reveal{
            filter:invert(100%)
        }
        .input-box i{
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            left: 14px;
            color: rgb(255, 255, 255 ,0.75);
            font-size: 18px;
            transition: 0.25s;
        }
        .input-box input:focus +i {
            color: white;
        }
        .remember-forgot-box{
            display: flex;
            width: 100%;
            margin-top: 16px;
            justify-content: space-between;
        }
        .remember-forgot-box h5{
            font-weight: normal;
        }
        .remember-me{
            display: flex;
            gap: 8px;
        }
        
    </style>
</head>
<body>
    <from class="container">
        <h1 class="login-title">Login</h1>
        <img src="user_456141.png" alt="no" height="12%" width="15%">
        <section class="input-box">
            
            <input type="text" name="username" placeholder="username">
            <i class="bx bxs-user"></i>
        </section>

        <section class="input-box">
            <input type="password" name="Mdp" placeholder="password">
            <i class="bx bxs-lock-alt" ></i>
        </section>
        
        <section class="remember-forgot-box">
            <div class="remember-me">
                <input type="checkbox" name="remember-me" id="remember-me">
                <label for="remember-me">
                    <h5>Remember-me</h5>
                </label>
            </div>
            <a href="#" class="forgot-password">
                <h5>forgot password ?</h5>
            </a>
        </section>

    <button class="login-button" type="submit" style="width: 250px;height: 35px; border-radius: 30px;"> Login </button>
        <h5 class="dont-have-an-account">
            Dont have an account?
            <a href="#">register</a>
        </h5>
    </from>
</body>
</html>
