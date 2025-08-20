
class AbstractManager {
  constructor({ table }) {
    this.table = table
  }

  find(id) {
    // Prisma: delegate based on model/table name
    return this.database[this.table].findUnique({
      where: { id: Number(id) },
    })
  }

  findAll() {
    return this.database[this.table].findMany()
  }

  delete(id) {
    return this.database[this.table].delete({ where: { id: Number(id) } })
  }

  setDatabase(database) {
    this.database = database
  }
}


export default AbstractManager;
