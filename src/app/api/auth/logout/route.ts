import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

    response.cookies.set('dashboard-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0
    });

    return response;
  } catch (error) {
    console.error('Erro no logout:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
