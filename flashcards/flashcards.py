"""
Aplicativo de flashcards desenvolvido em Python.

Permite criar, estudar, editar e excluir cartões de
pergunta e resposta sobre qualquer assunto.

"""
import os
import random
import sqlite3

# O banco fica sempre ao lado deste arquivo,
# não importa de qual pasta o script seja executado
CAMINHO_BANCO = os.path.join(os.path.dirname(os.path.abspath(__file__)), "flashcards.db")

# Conectar o Banco de Dados
conexao = sqlite3.connect(CAMINHO_BANCO)
cursor = conexao.cursor()

cursor.execute("""
    CREATE TABLE IF NOT EXISTS flashcards(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        enunciado TEXT NOT NULL,
        resposta TEXT NOT NULL
    )
""")
conexao.commit()


# Funções auxiliares
def perguntar_sim_nao(mensagem):
    """Pergunta até receber 's' ou 'n'. Retorna True para 's' e False para 'n'."""
    while True:
        resposta = input(mensagem).strip().lower()
        if resposta in ("s", "n"):
            return resposta == "s"
        print("[ERRO] Você deve digitar somente 'S' ou 'n'")


def ler_texto(mensagem):
    """Pede um texto até o usuário digitar algo que não seja vazio."""
    while True:
        texto = input(mensagem).strip()
        if texto:
            return texto
        print("[ERRO] Este campo não pode ficar vazio")


def carregar_flashcards():
    """Busca os cards direto do banco, assim a lista nunca fica desatualizada."""
    cursor.execute("SELECT id, enunciado, resposta FROM flashcards")
    return [
        {"id": id_cartao, "enunciado": enunciado, "resposta": resposta}
        for id_cartao, enunciado, resposta in cursor.fetchall()
    ]


# Cria os cards
def criar_flashcards():
    print("\n===== ÁREA DE CRIAÇÃO =====")
    criados = 0
    while True:
        enunciado = ler_texto("Lado da pergunta: ")
        resposta = ler_texto("Lado da resposta: ")

        cursor.execute(
            "INSERT INTO flashcards (enunciado, resposta) VALUES (?, ?)",
            (enunciado, resposta)
        )
        conexao.commit()
        criados += 1

        # Cria novos cards
        if not perguntar_sim_nao("\nDeseja criar novos flashcards? (S/n)\n"):
            break

    print(f"\nVocê criou {criados} flashcard(s)!")


# Estudar o flashcard
def estudar_flashcards():
    print("\n===== ÁREA DE ESTUDO =====")
    while True:
        flashcards = carregar_flashcards()

        if not flashcards:
            print("Não existe flashcards registrados. Crie alguns primeiro!")
            return

        random.shuffle(flashcards)

        for card in flashcards:
            print("\nEnunciado: " + card["enunciado"])
            input("\nAperte Enter quando quiser virar")
            print("\nResposta correta: " + card["resposta"])

        if not perguntar_sim_nao("\nDeseja estudar novamente (S/n)?\n"):
            break


# Editar cards
def editar_flashcards():
    cartoes = carregar_flashcards()

    if not cartoes:
        print("Não existe flashcards registrados")
        return

    for card in cartoes:
        print(f"({card['id']})- P = {card['enunciado']} | R = {card['resposta']}")

    id_escolhido = input("Escolha um card para editar\n").strip()
    cursor.execute("SELECT id FROM flashcards WHERE id = ?", (id_escolhido,))
    if not cursor.fetchone():
        print("Nenhum flashcard encontrado com esse ID")
        return

    print("\n(1) Editar o enunciado ( Lado da Pergunta ): ")
    print("(2) Editar a resposta ( Lado da resposta ): ")
    print("(3) Editar ambos: ")
    print("Ou digite qualquer coisa para voltar ao Menu Inicial")

    opcao_edicao = input("\nEscolha uma opção\n").strip()

    if opcao_edicao == "1":
        novo_enunciado = ler_texto("Digite o novo enunciado: \n")
        cursor.execute("UPDATE flashcards SET enunciado = ? WHERE id = ?", (novo_enunciado, id_escolhido))
        conexao.commit()
        print("Enunciado atualizado com sucesso!")
    elif opcao_edicao == "2":
        nova_resposta = ler_texto("Digite a nova resposta: \n")
        cursor.execute("UPDATE flashcards SET resposta = ? WHERE id = ?", (nova_resposta, id_escolhido))
        conexao.commit()
        print("Resposta atualizada com sucesso!")
    elif opcao_edicao == "3":
        novo_enunciado = ler_texto("Digite o novo enunciado: \n")
        nova_resposta = ler_texto("Digite a nova resposta: \n")
        cursor.execute(
            "UPDATE flashcards SET enunciado = ?, resposta = ? WHERE id = ?",
            (novo_enunciado, nova_resposta, id_escolhido)
        )
        conexao.commit()
        print("Flashcard atualizado com sucesso!")
    else:
        return


# Excluir cards
def excluir_flashcards():
    cartoes = carregar_flashcards()

    if not cartoes:
        print("Não existe flashcards registrados")
        return

    for card in cartoes:
        print(f"{card['id']} - {card['enunciado']}")

    print("\n(0) Excluir todos os flashcards")
    print("(1) Excluir um flashcard específico")
    print("Ou digite qualquer coisa para voltar ao Menu Inicial")

    opcao_exclusao = input("\nEscolha uma opção: \n").strip()

    if opcao_exclusao == "0":
        if perguntar_sim_nao("Tem certeza que deseja excluir TODOS os flashcards? (S/n)\n"):
            cursor.execute("DELETE FROM flashcards")
            conexao.commit()
            print("Todos os flashcards foram excluídos!")
        else:
            print("Exclusão cancelada")
    elif opcao_exclusao == "1":
        id_digitado = input("Digite o ID do flashcard que deseja excluir: ").strip()
        if not id_digitado.isdigit():
            print("[ERRO] O ID precisa ser um número")
            return

        cursor.execute("DELETE FROM flashcards WHERE id = ?", (int(id_digitado),))
        conexao.commit()
        if cursor.rowcount > 0:
            print("Flashcard excluído com sucesso!")
        else:
            print("Nenhum flashcard encontrado com esse ID")
    else:
        print("Voltando ao Menu Inicial")


# Menu Principal
def main():
    try:
        while True:
            print("\n===== FLASHCARDS =====")
            print("(1) Criar Flashcards")
            print("(2) Estudar Flashcards")
            print("(3) Editar Flashcards")
            print("(4) Excluir Flashcards")
            print("(5) Sair")

            opcao = input("\nEscolha uma opção: \n").strip()

            if opcao == "1":
                criar_flashcards()
            elif opcao == "2":
                estudar_flashcards()
            elif opcao == "3":
                editar_flashcards()
            elif opcao == "4":
                excluir_flashcards()
            elif opcao == "5":
                break
            else:
                print("[ERRO] Escolha somente entre 1 a 5")
    finally:
        # Garante que a conexão com o banco sempre é fechada ao sair
        conexao.close()


if __name__ == "__main__":
    main()