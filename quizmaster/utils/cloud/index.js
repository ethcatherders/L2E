Moralis.Cloud.define("searchForUser", async (request) => {
  const { username, ethAddress } = request.params
  
  const query = new Moralis.Query(Moralis.User)

  const allUsers = await query.map(user => {
    return {
      id: user.id,
      username: user.attributes.username,
      ethAddress: user.attributes.ethAddress
    }
  }, {useMasterKey: true})
  
  const results = allUsers.filter(user => {
    if (ethAddress && user.ethAddress && user.ethAddress.toLowerCase() === ethAddress.toLowerCase()) {
      return true
    }
    if (username && user.username && user.username.toLowerCase() === username.toLowerCase()) {
      return true
    }
  })
  
  return results
})

Moralis.Cloud.define("addAdmin", async (request) => {
  const { id } = request.params

  const query = new Moralis.Query(Moralis.User)
  const user = await query.get(id, {useMasterKey: true})

  const Admin = Moralis.Object.extend("Admin")
  const newAdmin = new Admin()
  await newAdmin.save({ user })

  return { success: true }
})

Moralis.Cloud.define("getAdmins", async (request) => {
  const Admin = Moralis.Object.extend("Admin")
  const query = new Moralis.Query(Admin)
  const admins = await query.find({useMasterKey: true})
  const results = await Promise.all(admins.map(async (admin) => {
    const userquery = new Moralis.Query(Moralis.User)
    const user = await userquery.get(admin.attributes.user.id, {useMasterKey: true})
    return {
      id: user.id,
      username: user.getUsername(),
      ethAddress: user.attributes.ethAddress
    }
  }))

  return results
})