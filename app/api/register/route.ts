import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { normalizeEmail } from "@/utils/formatters";
import { isValidCpfFormat } from "@/utils/validators";
import { cpfValidationService } from "@/services/cpfValidationService"; // Import mock CPF service
import { sendVerificationEmail } from "@/lib/email"; // Added import for email service

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { name, email, password, cpf, about, city, state } = body;
    
    // Validação básica de campos obrigatórios
    if (!name || !email || !password || !cpf) {
      return NextResponse.json(
        { error: "Nome, email, senha e CPF são obrigatórios" },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    const cleanedCpf = cpf.replace(/\D/g, '');
    if (!isValidCpfFormat(cleanedCpf)) { // Basic local format check first
      return NextResponse.json(
        { error: "Formato de CPF inválido" },
        { status: 400 }
      );
    }

    // External CPF Validation (using the mock service)
    const cpfValidationResult = await cpfValidationService.validateCpf(cleanedCpf);
    if (!cpfValidationResult.isValid) {
      return NextResponse.json(
        { error: cpfValidationResult.message || "CPF inválido ou com restrições." },
        { status: 400 }
      );
    }
    
    // Verificar se o usuário já existe com o email normalizado ou CPF
    // (These checks are still relevant even after external validation,
    // as external validation might not check for uniqueness in *our* system)
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      );
    }

    const existingUserByCpf = await prisma.user.findUnique({
      where: { cpf: cleanedCpf },
    });

    if (existingUserByCpf) {
      return NextResponse.json(
        { error: "CPF já cadastrado em nosso sistema" }, // Clarify message
        { status: 400 }
      );
    }
    
    // Hash da senha
    const hashedPassword = await hash(password, 10);
    const emailVerificationToken = uuidv4(); // Generate a unique token
    
    // Criar o usuário usando Prisma Client
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        name,
        email: normalizedEmail,
        password: hashedPassword,
        cpf: cleanedCpf, // Store cleaned CPF
        emailIsVerified: false, // Default to false
        emailVerificationToken, // Store the token
        about: about || null,
        city: city || null,
        state: state || null,
        wallet: {
          create: {
            balance: 0,
          },
        },
      },
      select: { // Select fields to return (excluding sensitive ones like token for now)
        id: true,
        name: true,
        email: true,
        // emailVerificationToken: true, // For testing, can be returned. Remove for production if not needed by client.
      },
    });
    
    // Send verification email
    const emailResult = await sendVerificationEmail(normalizedEmail, emailVerificationToken);

    if (!emailResult.success) {
      // Log the error, but don't necessarily fail the registration.
      // The user is created, they might be able to request verification again later.
      console.error(`Failed to send verification email to ${normalizedEmail}:`, emailResult.error);
      // Depending on policy, you might want to alert the user or handle this differently.
      // For now, the registration is considered successful even if email sending fails.
    }

    // Return a success message without the token
    return NextResponse.json(
      {
        user: { id: user.id, name: user.name, email: user.email },
        message: "Registration successful. Please check your email to verify your account.",
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
