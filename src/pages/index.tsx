"use client"

import React, { useEffect, useState } from "react"
import { Send, MessageCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

interface Partido {
  id: string
  name: string
  party: string
  image: string
  description: string
}

interface Message {
  id: number
  text: string
  isUser: boolean
  timestamp: Date
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-center p-8 rounded-lg shadow-lg bg-white">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Error en la aplicación</h2>
            <p className="mb-4">Ha ocurrido un error al cargar los datos. Por favor, intenta recargar la página.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Home() {
  const [partidos, setPartidos] = useState<Partido[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<Partido | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")

  const fetchPartidos = async () => {
    try {
      setLoading(true)
      const res = await fetch('https://api-truboot.fbarrientostakata.workers.dev/api/v1/partidos')
      
      if (!res.ok) {
        throw new Error('Failed to fetch partidos')
      }
      
      const data = await res.json()
      
      if (!data?.data?.keys) {
        throw new Error('Respuesta de API inválida')
      }

      const partidosList = await Promise.all(
        data.data.keys.map(async (key: any) => {
          try {
            const partidoId = key.name.split('/')[1]
            
            const partidoResponse = await fetch(`https://api-truboot.fbarrientostakata.workers.dev/api/v1/partidos/${partidoId}`)
            
            if (!partidoResponse.ok) {
              throw new Error(`Failed to fetch partido details for ID ${partidoId}`)
            }
            
            const partidoData = await partidoResponse.json()
            
            try {
              // The data is already parsed as an object
              const parsedData = JSON.parse(partidoData.data)
              
              // Get only the necessary data and provide defaults if undefined
              const name = parsedData.presidente?.nombrePresidente || 'Nombre no disponible'
              const party = parsedData.partido || 'Partido no disponible'
              const image = parsedData.presidente?.foto || '/placeholder.svg'
              const description = parsedData.descripcion || 'Descripción no disponible'
              
              return {
                id: partidoId,
                name,
                party,
                image,
                description,
              }
            } catch (error) {
              console.error(`Error parsing partido data for ID ${partidoId}:`, error)
              return {
                id: partidoId,
                name: 'Error al cargar',
                party: 'Error al cargar',
                image: '/placeholder.svg',
                description: 'Error al cargar',
              }
            }
          } catch (error) {
            console.error(`Error loading partido data:`, error)
            return {
              id: key.name.split('/')[1],
              name: 'Error al cargar',
              party: 'Error al cargar',
              image: '/placeholder.svg',
              description: 'Error al cargar',
            }
          }
        })
      )
      
      setPartidos(partidosList)
      if (partidosList.length > 0) {
        setSelectedCandidate(partidosList[0])
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching partidos:', error)
      setError('Error al cargar los partidos. Por favor, inténtalo de nuevo.')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPartidos()
  }, [])

  const handleCandidateSelect = (candidate: Partido) => {
    setSelectedCandidate(candidate)
    setMessages([
      {
        id: 1,
        text: `¡Hola! Soy ${candidate.name}. ${candidate.description}. ¿En qué puedo ayudarte hoy?`,
        isUser: false,
        timestamp: new Date(),
      },
    ])
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedCandidate) return

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    }

    const botResponse: Message = {
      id: messages.length + 2,
      text: `Gracias por tu pregunta sobre "${inputMessage}". Como ${selectedCandidate.name}, mi posición es trabajar por el bienestar de todos los ciudadanos. ¿Hay algo más específico que te gustaría saber sobre mis propuestas?`,
      isUser: false,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage, botResponse])
    setInputMessage("")
  }

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (error || apiError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-red-500 text-xl">{error || apiError}</h2>
        <button
          onClick={fetchPartidos}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-all duration-200"
        >
          Intentar nuevamente
        </button>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 p-6 shadow-lg">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Candidatos Interactivos</h1>
              <p className="text-white/90 mt-2">Selecciona un candidato y conversa con él</p>
            </div>
            <Link href="/problems">
              <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 backdrop-blur-sm">
                Ver Problemas del País
                <ArrowRight size={20} />
              </button>
            </Link>
          </div>
        </header>

        {/* Candidates Section */}
        <section className="p-6 bg-gradient-to-br from-gray-100 to-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Selecciona tu Candidato</h2>

          {/* Card Container */}
          <div className="relative max-w-6xl mx-auto">
            <div className="flex gap-6 overflow-x-auto pb-6 px-4 scrollbar-hide">
              {partidos.map((partido) => (
                <div
                  key={partido.id}
                  className={`flex-shrink-0 w-80 transition-all duration-300 hover:scale-105 ${
                    selectedCandidate?.id === partido.id ? "ring-4 ring-blue-400" : ""
                  }`}
                >
                  <div
                    className={`relative p-8 rounded-2xl border-2 ${getPartyColor(partido.party)} bg-gradient-to-br from-white to-gray-50 shadow-xl hover:shadow-2xl transition-all duration-300 min-h-[400px] flex flex-col`}
                  >
                    {/* Profile Image */}
                    <div className="flex justify-center mb-6">
                      <div
                        className={`p-2 rounded-full ${
                          partido.party === "Partido Verde"
                            ? "bg-green-500"
                            : partido.party === "Partido Rojo"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                        }`}
                      >
                        <img
                          src={partido.image || "/placeholder.svg"}
                          alt={partido.name}
                          className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                        />
                      </div>
                    </div>

                    {/* Candidate Info */}
                    <div className="text-center flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{partido.name}</h3>
                        <p
                          className={`text-sm font-semibold mb-4 ${
                            partido.party === "Partido Verde"
                              ? "text-green-600"
                              : partido.party === "Partido Rojo"
                                ? "text-red-600"
                                : "text-yellow-600"
                          }`}
                        >
                          {partido.party}
                        </p>
                        <p className="text-gray-600 text-sm leading-relaxed mb-6">{partido.description}</p>
                      </div>

                      {/* Message Button */}
                      <button
                        onClick={() => handleCandidateSelect(partido)}
                        className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 ${
                          selectedCandidate?.id === partido.id
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg"
                            : partido.party === "Partido Verde"
                              ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                              : partido.party === "Partido Rojo"
                                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                                : "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                        }`}
                      >
                        {selectedCandidate?.id === partido.id ? "Seleccionado" : "Conversar"}
                      </button>
                    </div>

                    {/* Party Badge */}
                    <div
                      className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
                        partido.party === "Partido Verde"
                          ? "bg-green-100 text-green-800"
                          : partido.party === "Partido Rojo"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {partido.party ? partido.party.split(" ")[1] || partido.party : "Sin partido"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Pagination Dots */}
            <div className="flex justify-center mt-6 space-x-2">
              {partidos.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === 0 ? "bg-red-500" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Chat Section */}
        <section className="flex-1 p-6">
          {selectedCandidate ? (
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Candidate Avatar/Silhouette */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl border border-gray-300 p-6 h-full">
                    <div className="text-center">
                      <div className="relative mb-4">
                        <img
                          src={selectedCandidate.image || "/placeholder.svg"}
                          alt={selectedCandidate.name}
                          className="w-32 h-32 rounded-full border-4 border-gray-200 mx-auto"
                        />
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs">
                          En línea
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">{selectedCandidate.name}</h3>
                      <p className="text-gray-600 mb-4">{selectedCandidate.party}</p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700">{selectedCandidate.description}</p>
                      </div>

                      {/* Animated speaking indicator */}
                      <div className="mt-6 flex justify-center">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Interface */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl border border-gray-300 h-full flex flex-col">
                    {/* Chat Header */}
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 rounded-t-xl border-b border-gray-300">
                      <h4 className="font-semibold text-gray-800">Conversación con {selectedCandidate.name}</h4>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto" style={{ maxHeight: "400px" }}>
                      {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.isUser
                                ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                                : "bg-gradient-to-r from-green-500 to-green-600 text-white"
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                            <p className="text-xs opacity-75 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                          placeholder="Escribe tu pregunta..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                        />
                        <button
                          onClick={handleSendMessage}
                          className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 flex items-center gap-2"
                        >
                          <Send size={16} />
                          Enviar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto text-center py-20">
              <MessageCircle size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Selecciona un candidato</h3>
              <p className="text-gray-500">Elige un candidato de arriba para comenzar a conversar</p>
            </div>
          )}
        </section>
      </div>
    </ErrorBoundary>
  )
}