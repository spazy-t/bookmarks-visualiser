//has to call a function on the server as the fs package only runs away from a client side file
const readFile = async () => {
    const res = await fetch('http://localhost:3030/read')

    try {
        const data = await res.json()
        return {
            children: data[0].children,
            id: 'root',
            name: 'Root'
        }
    } catch (err) {
        console.log('error reading file', err)
    }
}

const readStream = async () => {
    const res = await fetch('http://localhost:3030/readStream')

    try {
        const data = await res.json()
        let rootFolders = []

        for (const item of Object.keys(data.roots)) {
            rootFolders.push({
                name: item,
                ...data.roots[item]
            })
        }

        return {
            children: rootFolders,
            id: 'root',
            name: 'Root'
        }
    } catch (err) {
        console.log('error getting browser bookmarks:', err)
    }
}

export {
    readFile,
    readStream
}