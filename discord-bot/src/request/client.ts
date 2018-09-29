import got from 'got'

// @ts-ignore #extend is not included in the defintion for some reason?
const client = got.extend({
    json: true
})

export default client