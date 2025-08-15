export class ConfigError extends Error {
  missing: string[]
  constructor(message: string, missing: string[] = []) {
    super(message)
    this.name = 'ConfigError'
    this.missing = missing
  }
}

export class CatalogEmptyError extends Error {
  constructor(message = 'Palette catalog is empty or insufficient') {
    super(message)
    this.name = 'CatalogEmptyError'
  }
}

export class NormalizeError extends Error {
  constructor(message = 'Failed to normalize or repair palette') {
    super(message)
    this.name = 'NormalizeError'
  }
}

