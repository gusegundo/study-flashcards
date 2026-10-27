from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# Configurar CORS para o React comunicar com o FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelo de Dados
class Flashcard(BaseModel):
    enunciado: str
    resposta: str
    categoria: Optional[str] = "Geral"

# Base de dados simulada em memória (ou substitui pela tua lógica atual)
flashcards_db = []
contador_id = 1

@app.get("/flashcards")
def listar_flashcards():
    return {"flashcards": flashcards_db}

@app.post("/flashcards")
def criar_flashcard(card: Flashcard):
    global contador_id
    novo_card = {
        "id": contador_id,
        "enunciado": card.enunciado,
        "resposta": card.resposta,
        "categoria": card.categoria or "Geral"
    }
    flashcards_db.append(novo_card)
    contador_id += 1
    return {"mensagem": "Flashcard criado com sucesso!", "flashcard": novo_card}

@app.put("/flashcards/{card_id}")
def editar_flashcard(card_id: int, card: Flashcard):
    for fc in flashcards_db:
        if fc["id"] == card_id:
            fc["enunciado"] = card.enunciado
            fc["resposta"] = card.resposta
            fc["categoria"] = card.categoria or "Geral"
            return {"mensagem": "Flashcard atualizado com sucesso!", "flashcard": fc}
    raise HTTPException(status_code=404, detail="Flashcard não encontrado")

@app.delete("/flashcards/{card_id}")
def deletar_flashcard(card_id: int):
    global flashcards_db
    tamanho_inicial = len(flashcards_db)
    flashcards_db = [fc for fc in flashcards_db if fc["id"] != card_id]
    
    if len(flashcards_db) == tamanho_inicial:
        raise HTTPException(status_code=404, detail="Flashcard não encontrado")
    
    return {"mensagem": "Flashcard apagado com sucesso!"}