function parse(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version)
  if (!match) throw new Error('invalid semantic version')
  return match.slice(1).map(Number)
}

function nextVersion(current, decisionType) {
  const [major, minor, patch] = parse(current)
  if (decisionType === 'CREATE_FAMILY') return `${major}.${minor + 1}.0`
  if (decisionType === 'ASSOCIATE_EXISTING_FAMILY') return `${major}.${minor}.${patch + 1}`
  return current
}

module.exports = { nextVersion, parse }
