import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email and OTP are required",
                },
                { status: 400 }
            );
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"VDR Team" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Email Verification OTP",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>Email Verification</h2>
          
          <p>Hello,</p>
          
          <p>Your verification OTP is:</p>

          <div style="
            font-size:32px;
            font-weight:bold;
            letter-spacing:8px;
            padding:16px;
            background:#f4f4f4;
            text-align:center;
            border-radius:8px;
          ">
            ${otp}
          </div>

          <p style="margin-top:20px;">
            This OTP is valid for 5 minutes.
          </p>

          <p>
            If you did not request this verification,
            please ignore this email.
          </p>

          <br />

          <p>Thanks,</p>
          <p>VDR Team</p>
        </div>
      `,
        });

        return NextResponse.json({
            success: true,
            message: "OTP sent successfully",
        });
    } catch (error) {
        console.error("OTP Mail Error:", error);

        return NextResponse.json(
            {
                success: false,
                message: error.message,
            },
            { status: 500 }
        );
    }
}