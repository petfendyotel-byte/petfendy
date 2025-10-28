"use client"

import { useState, useEffect } from "react"
import type { Pet } from "@/lib/types"
import { useAuth } from "./auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, Plus } from "lucide-react"

export function PetManagement() {
  const { user } = useAuth()
  const [pets, setPets] = useState<Pet[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "dog" as const,
    breed: "",
    age: "",
    weight: "",
    specialNeeds: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    // Load pets from localStorage
    const storedPets = JSON.parse(localStorage.getItem(`petfendy_pets_${user?.id}`) || "[]")
    setPets(storedPets)
  }, [user?.id])

  const handleAddPet = () => {
    setError("")
    setSuccess("")

    if (!formData.name || !formData.breed || !formData.age || !formData.weight) {
      setError("Lütfen tüm alanları doldurun")
      return
    }

    if (Number.parseFloat(formData.age) <= 0 || Number.parseFloat(formData.weight) <= 0) {
      setError("Yaş ve ağırlık pozitif sayı olmalıdır")
      return
    }

    const newPet: Pet = {
      id: editingPet?.id || `pet-${Date.now()}`,
      userId: user?.id || "",
      name: formData.name,
      type: formData.type,
      breed: formData.breed,
      age: Number.parseFloat(formData.age),
      weight: Number.parseFloat(formData.weight),
      specialNeeds: formData.specialNeeds,
    }

    let updatedPets: Pet[]
    if (editingPet) {
      updatedPets = pets.map((p) => (p.id === editingPet.id ? newPet : p))
      setSuccess("Evcil hayvan güncellendi")
    } else {
      updatedPets = [...pets, newPet]
      setSuccess("Evcil hayvan eklendi")
    }

    setPets(updatedPets)
    localStorage.setItem(`petfendy_pets_${user?.id}`, JSON.stringify(updatedPets))

    setFormData({
      name: "",
      type: "dog",
      breed: "",
      age: "",
      weight: "",
      specialNeeds: "",
    })
    setEditingPet(null)
    setShowForm(false)

    setTimeout(() => setSuccess(""), 3000)
  }

  const handleDeletePet = (petId: string) => {
    const updatedPets = pets.filter((p) => p.id !== petId)
    setPets(updatedPets)
    localStorage.setItem(`petfendy_pets_${user?.id}`, JSON.stringify(updatedPets))
    setSuccess("Evcil hayvan silindi")
    setTimeout(() => setSuccess(""), 3000)
  }

  const handleEditPet = (pet: Pet) => {
    setEditingPet(pet)
    setFormData({
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      age: pet.age.toString(),
      weight: pet.weight.toString(),
      specialNeeds: pet.specialNeeds,
    })
    setShowForm(true)
  }

  const petTypeLabels = {
    dog: "Köpek",
    cat: "Kedi",
    bird: "Kuş",
    rabbit: "Tavşan",
    other: "Diğer",
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Evcil Hayvanlarım</h2>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Yeni Evcil Hayvan
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingPet ? "Evcil Hayvanı Düzenle" : "Yeni Evcil Hayvan Ekle"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ad</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: Boncuk"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tür</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  {Object.entries(petTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Irk</label>
                <Input
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  placeholder="Örn: Golden Retriever"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Yaş</label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="3"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ağırlık (kg)</label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="25"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Özel İhtiyaçlar</label>
              <Input
                value={formData.specialNeeds}
                onChange={(e) => setFormData({ ...formData, specialNeeds: e.target.value })}
                placeholder="Örn: Diyetli mama, ilaç vb."
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddPet} className="flex-1">
                {editingPet ? "Güncelle" : "Ekle"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingPet(null)
                  setFormData({
                    name: "",
                    type: "dog",
                    breed: "",
                    age: "",
                    weight: "",
                    specialNeeds: "",
                  })
                }}
                className="flex-1"
              >
                İptal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pets.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Henüz evcil hayvan eklenmedi</p>
            </CardContent>
          </Card>
        ) : (
          pets.map((pet) => (
            <Card key={pet.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{pet.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{petTypeLabels[pet.type]}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditPet(pet)}>
                      Düzenle
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeletePet(pet.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Irk</p>
                    <p className="font-semibold">{pet.breed}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Yaş</p>
                    <p className="font-semibold">{pet.age} yaş</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ağırlık</p>
                    <p className="font-semibold">{pet.weight} kg</p>
                  </div>
                  {pet.specialNeeds && (
                    <div>
                      <p className="text-muted-foreground">Özel İhtiyaçlar</p>
                      <p className="font-semibold text-xs">{pet.specialNeeds}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
