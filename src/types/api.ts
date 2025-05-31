export interface Problem {
  id: string
  titulo: string
  descripcion: string
}

export interface ApiResponse<T> {
  message: string
  data: T
}

export interface ProblemsResponse extends ApiResponse<Problem | Problem[]> {}
