# Overview of Relational Databases - (PostgreSQL)

## DML Commands - *(Data Manipulation Language)*

> Comandos para manipular dados dentro de um banco de dados.

* SELECT : `Recupera dado(s) de uma ou mais tabelas`
 
```sql
SELECT name, email FROM users WHERE age > 18;
```

* INSERT : `Insere novos registros em uma tabela`
 
```sql
INSERT INTO users (name, email, age)
VALUES ('Alice', 'alice@example.com', 20),
        ('Carol', 'carol@example.com', 22);
```

* UPDATE : `Atualiza valores de registros existentes em uma tabela`
 
```sql
  UPDATE users
  SET email = 'bob@example.com', age = 32
  WHERE name = 'Alice';
```

* DELETE : `Remove um registro de uma tabela`

```sql
  DELETE FROM users
  WHERE name = 'Carol';
```

* TRUNCATE : `Remove todos os dados de uma tabela, mantendo a tabela intacta, de forma mais rápida mas sem manter logs de campo removido.`

```sql
  TRUNCATE TABLE users;
```

* ROLLBACK : `Reverte uma transação inteira ou até um ponto de salvamento`
  
```sql
  ROLLBACK;
```

## DDL Commands - *(Data Definition Language)*
> Comandos para definir e gerenciar a estrutura dos objetos de um banco de dados como tabelas, índices, visões, procedimentos armazenados e outras entidades relacionadas.

* CREATE : `Cria objetos no banco de dados`

```sql
  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    age INT
  );
```
* ALTER : `Modifica a estrutura de objetos existentes em um banco de dados como adicionar, modificar ou remover colunas de uma tabela, ou alterar um índice.`

```sql
Adicionar uma coluna
  ALTER TABLE users
  ADD COLUMN birth_day DATE;

Modificar uma coluna
  ALTER TABLE users
  ALTER COLUMN age TYPE VARCHAR(3);

Remover uma coluna
  ALTER TABLE users
  DROP COLUMN age;

Renomear uma tabela
  ALTER TABLE users
  RENAME TO clients;
```

* DROP : `Exclui objetos do banco de dados, como tabelas, views e indices.`

```sql
  DROP TABLE users;
```

* TRUNCATE : `Remove todos os dados de uma tabela, mantendo a tabela intacta`

```sql
  TRUNCATE TABLE users;
```

* RENAME : `Renomear objetos no banco de dados, tabelas, colunas, indices`

```sql
Renomear uma coluna
  ALTER TABLE users RENAME COLUMN email TO email_address;
```

## Cardinality

> Relacionamento entre as tabelas e o número de registros que podem estar associados entre elas.

* One-to-One *(1:1 or 1)* : `UM usuário tem no máximo UM perfil associado.`

```
Users            Profiles
-----            --------
id | name        id  | theme
---------        -----------
1  | Carlos  ->   1  | dark
2  | Alice   ->   2  | light
```

* One-to-Many *(1:n)* : `UM autor possui UM OU MAIS livros associados.`
  
```
Author                Books
------                --------
id | name             id  |     name     | author_id
---------             ------------------------------
1  | J.K Rowling  ->   1  | Harry Potter |     1                    
2  | George R.R  |->   2  | GoT          |     2
                 |->   3  | GoT 2        |     2   
```

* Many-to-Many *(n:m or n)* : `UM livro pode pertencer a MUITAS categorias e UMA categoria pode conter MUITOS livros.`

```
Books                   Categories        Book_Categories
-----                   ----------        ---------------
id | title              id  | name        book_id  | categorie_id
-----------             ----------        ------------------------
1  | Harry Potter        1  | Fantasy         1    |      1
2  | Lord of the Rings   2  | Adventure       1    |      2
                         3  | Sci-fi          2    |      1
```