/**
 * Return the provided user's name and discriminator using the format: "name#discriminator"
 * 
 * @param {user} user The user
 */
export function formatName(user)
{
    return `${user.username}#${user.discriminator}`
}