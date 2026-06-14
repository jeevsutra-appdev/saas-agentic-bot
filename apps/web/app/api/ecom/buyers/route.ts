export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db/src/localDb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenantSlug");
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");

    if (!tenantSlug) {
      return NextResponse.json({ error: "Missing tenantSlug" }, { status: 400 });
    }

    if (!email && !phone) {
      return NextResponse.json({ error: "Missing identifier (email or phone)" }, { status: 400 });
    }

    const allOrders = await LocalDbController.getOrders(tenantSlug);
    const products = await LocalDbController.getProductsByTenant(tenantSlug);

    const buyerOrders = allOrders.filter(order => {
      const matchEmail = email && order.buyerEmail?.toLowerCase() === email.toLowerCase();
      const matchPhone = phone && order.buyerPhone === phone;
      return matchEmail || matchPhone;
    });

    // Populate order product details for card displays
    const populatedOrders = buyerOrders.map(order => {
      const product = products.find(p => p.id === order.productId);
      return {
        ...order,
        productName: product?.name || "Premium Food Item",
        productImage: product?.image || "",
        productDescription: product?.description || ""
      };
    });

    return NextResponse.json({ success: true, orders: populatedOrders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, tenantSlug, email, phone, name, password, code, inputOtp } = body;

    if (!tenantSlug) {
      return NextResponse.json({ error: "Missing tenantSlug" }, { status: 400 });
    }

    if (action === "send_otp") {
      if (!email && !phone) {
        return NextResponse.json({ error: "Email or Phone required" }, { status: 400 });
      }
      
      // Simulate sending a 4-digit code (e.g. 1986 or 1234)
      const simulatedCode = "1234";
      return NextResponse.json({ 
        success: true, 
        message: `OTP sent successfully!`, 
        simulatedCode, 
        note: `For local testing, enter simulated code: ${simulatedCode}`
      });
    }

    if (action === "register") {
      if (!email && !name) {
        return NextResponse.json({ error: "Missing required registration details" }, { status: 400 });
      }

      // Check if user already exists
      const existingEmail = email ? await LocalDbController.getUserByEmail(email) : null;
      const existingPhone = phone ? await LocalDbController.getUserByPhone(phone) : null;

      if (existingEmail || existingPhone) {
        return NextResponse.json({ error: "Account already exists with this email or phone number" }, { status: 400 });
      }

      const newUser = {
        email: email || `${phone}@temp.com`,
        passwordHash: password || "password123", // Default mock password if OTP used
        role: "buyer" as const,
        tenantSlug,
        phone,
        name
      };

      await LocalDbController.saveUser(newUser);
      return NextResponse.json({ 
        success: true, 
        user: { email: newUser.email, phone: newUser.phone, name: newUser.name } 
      });
    }

    if (action === "login") {
      if (!email && !phone) {
        return NextResponse.json({ error: "Email or Phone required for login" }, { status: 400 });
      }

      let user = email ? await LocalDbController.getUserByEmail(email) : null;
      if (!user && phone) {
        user = await LocalDbController.getUserByPhone(phone);
      }

      // If user doesn't exist, auto-register for OTP logs to keep client checkout frictionless!
      if (!user) {
        if (inputOtp === "1234" || password) {
          const newUser = {
            email: email || `${phone}@temp-buyer.com`,
            passwordHash: password || "password123",
            role: "buyer" as const,
            tenantSlug,
            phone,
            name: email ? email.split("@")[0] : `Guest Customer`
          };
          await LocalDbController.saveUser(newUser);
          user = newUser;
        } else {
          return NextResponse.json({ error: "User not found. Check credentials or request OTP." }, { status: 400 });
        }
      }

      // Verify OTP or password
      if (inputOtp) {
        if (inputOtp !== "1234") {
          return NextResponse.json({ error: "Invalid verification code. Please enter '1234'" }, { status: 400 });
        }
      } else if (password) {
        if (user.passwordHash !== password) {
          return NextResponse.json({ error: "Invalid password" }, { status: 400 });
        }
      }

      return NextResponse.json({ 
        success: true, 
        user: { email: user.email, phone: user.phone, name: user.name } 
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
