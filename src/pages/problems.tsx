"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, DollarSign, Fuel } from "lucide-react"

interface Problem {
  id: string
  titulo: string
  descripcion: string
}

interface CandidateResponse {
  candidateId: number
  candidateName: string
  party: string
  image: string
  response: string
}

const candidateResponses: Record<string, CandidateResponse[]> = {
  "Combustible": [
    {
      candidateId: 1,
      candidateName: "Ana García",
      party: "Partido Verde",
      image: "/placeholder.svg?height=80&width=80",
      response:
        "Promoveré la transición hacia vehículos eléctricos con subsidios y una red nacional de carga, reduciendo nuestra dependencia de combustibles fósiles.",
    },
    {
      candidateId: 2,
      candidateName: "Carlos López",
      party: "Partido Rojo",
      image: "/placeholder.svg?height=80&width=80",
      response:
        "Mantendré subsidios focalizados para el transporte público y trabajadores, mientras negocio mejores precios con proveedores internacionales.",
    },
    {
      candidateId: 3,
      candidateName: "María Rodríguez",
      party: "Partido Amarillo",
      image: "/placeholder.svg?height=80&width=80",
      response:
        "Desarrollaré una plataforma digital para optimizar la distribución de combustibles y reducir costos operativos que se trasladen al consumidor.",
    },
    {
      candidateId: 4,
      candidateName: "José Martínez",
      party: "Partido Verde",
      image: "/placeholder.svg?height=80&width=80",
      response:
        "Invertiré en refinación nacional y biocombustibles para reducir importaciones y crear empleos verdes en el sector energético.",
    },
    {
      candidateId: 5,
      candidateName: "Laura Sánchez",
      party: "Partido Rojo",
      image: "/placeholder.svg?height=80&width=80",
      response:
        "Implementaré un sistema de precios justos que proteja tanto a consumidores como a distribuidores, con transparencia total en la cadena de costos.",
    },
  ],
  "El Dólar": [
    {
      candidateId: 1,
      candidateName: "Ana García",
      party: "Partido Verde",
      image: "/placeholder.svg?height=80&width=80",
      response:
        "Propongo una política monetaria sostenible que fortalezca nuestra moneda a través de inversiones en energías renovables y exportación de productos verdes.",
    },
    {
      candidateId: 2,
      candidateName: "Carlos López",
      party: "Partido Rojo",
      image: "/placeholder.svg?height=80&width=80",
      response:
        "Mi plan incluye controles de cambio temporales y un programa de estabilización económica que proteja a las familias trabajadoras del impacto del dólar.",
    },
    {
      candidateId: 3,
      candidateName: "María Rodríguez",
      party: "Partido Amarillo",
      image: "/placeholder.svg?height=80&width=80",
      response:
        "Implementaré un sistema de bandas cambiarias inteligente respaldado por tecnología blockchain para mayor transparencia y estabilidad.",
    },
    {
      candidateId: 4,
      candidateName: "José Martínez",
      party: "Partido Verde",
      image: "/placeholder.svg?height=80&width=80",
      response:
        "Fomentaré la desdolarización gradual promoviendo el uso de nuestra moneda nacional en sectores clave como salud y educación.",
    },
    {
      candidateId: 5,
      candidateName: "Laura Sánchez",
      party: "Partido Rojo",
      image: "/placeholder.svg?height=80&width=80",
      response:
        "Estableceré un fondo de estabilización cambiaria financiado con recursos de la lucha contra la corrupción y mejora en la recaudación fiscal.",
    },
  ]
}

export default function Problems() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedProblem, setSelectedProblem] = useState<string>("")

  const fetchProblems = async () => {
    try {
      setLoading(true)
      
      const res = await fetch('https://api-truboot.fbarrientostakata.workers.dev/api/v1/problemas')
      
      if (!res.ok) {
        throw new Error('Failed to fetch problems')
      }
      
      const data = await res.json()
      
      if (!data?.data?.keys) {
        throw new Error('Respuesta de API inválida')
      }

      const problemsList = await Promise.all(
        data.data.keys.map(async (key: any) => {
          try {
            const problemId = key.name.split('/')[1]
            
            const problemResponse = await fetch(`https://api-truboot.fbarrientostakata.workers.dev/api/v1/problemas/${problemId}`)
            
            if (!problemResponse.ok) {
              throw new Error(`Failed to fetch problem details for ID ${problemId}`)
            }
            
            const problemData = await problemResponse.json()
            
            try {
              const parsedData = JSON.parse(problemData.data)
              
              return {
                id: problemId,
                titulo: parsedData.titulo,
                descripcion: parsedData.descripcion
              }
            } catch (err) {
              console.error('Error parsing JSON:', err)
              return {
                id: problemId,
                titulo: 'Error al cargar',
                descripcion: 'No se pudo cargar la información del problema'
              }
            }
          } catch (err) {
            console.error('Error fetching problem details:', err)
            return {
              id: key.name.split('/')[1],
              titulo: 'Error al cargar',
              descripcion: 'No se pudo cargar la información del problema'
            }
          }
        })
      )
      
      setProblems(problemsList)
      
      if (problemsList.length > 0) {
        setSelectedProblem(problemsList[0].id)
      }
      
      setLoading(false)
    } catch (err) {
      console.error('Error fetching problems:', err)
      setError('Error al cargar los problemas. Por favor, inténtalo de nuevo.')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProblems()
  }, [])

  const getPartyColor = (party: string) => {
    switch (party) {
      case "Partido Verde":
        return "border-green-500 bg-green-50"
      case "Partido Rojo":
        return "border-red-500 bg-red-50"
      case "Partido Amarillo":
        return "border-yellow-500 bg-yellow-50"
      default:
        return "border-gray-300 bg-gray-50"
    }
  }

  const getProblemIcon = (title: string) => {
    switch (title) {
      case "Combustible":
        return <Fuel className="w-6 h-6" />
      case "El Dólar":
        return <DollarSign className="w-6 h-6" />
      default:
        return <DollarSign className="w-6 h-6" />
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-red-500 text-xl">{error}</h2>
        <button
          onClick={fetchProblems}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-all duration-200"
        >
          Intentar nuevamente
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/">
            <button className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all duration-200 backdrop-blur-sm">
              <ArrowLeft size={24} />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Problemas del País</h1>
            <p className="text-white/90 mt-2">Conoce las propuestas de todos los candidatos</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Menu */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-300 p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Problemas más fuertes del país</h2>
              <nav className="space-y-3">
                {problems.map((problem) => (
                  <button
                    key={`problem-${problem.id}`}
                    onClick={() => setSelectedProblem(problem.id)}
                    className={`w-full text-left p-4 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                      selectedProblem === problem.id
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                   {/* {getProblemIcon(problem.titulo)} */}
                    <div>
                      <div className="font-semibold">{problem.titulo}</div>
                      <div className={`text-sm ${selectedProblem === problem.id ? "text-red-100" : "text-gray-500"}`}>
                        {problem.descripcion}
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {problems.length > 0 && (
              <>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Propuestas para: {problems.find((p) => p.id === selectedProblem)?.titulo}
                  </h3>
                  <p className="text-gray-600">{problems.find((p) => p.id === selectedProblem)?.descripcion}</p>
                </div>

                {/* Candidate Response Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {candidateResponses[problems.find((p) => p.id === selectedProblem)?.titulo || ""]?.map((response) => (
                    <div
                      key={response.candidateId}
                      className={`p-6 rounded-xl border-2 ${getPartyColor(response.party)} shadow-lg hover:shadow-xl transition-all duration-300`}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={response.image || "/placeholder.svg"}
                          alt={response.candidateName}
                          className="w-16 h-16 rounded-full border-4 border-white shadow-md"
                        />
                        <div>
                          <h4 className="text-lg font-bold text-gray-800">{response.candidateName}</h4>
                          <p className="text-sm text-gray-600">{response.party}</p>
                        </div>
                      </div>
                      <div className="bg-white/70 p-4 rounded-lg">
                        <p className="text-gray-700 leading-relaxed">{response.response}</p>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Link href="/">
                          <button className="text-sm bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-4 py-2 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200">
                            Chatear con {response.candidateName.split(" ")[0]}
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}