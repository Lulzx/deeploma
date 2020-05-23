const easyvk = require('easyvk')
function load_posts() {
    easyvk({
        clientId : 7101425,
        clientSecret: "23acc95023acc95023acc9504023c092a1223ac23acc9507ef4dc240205bcafea27244d"
    }).then(vk => {
        console.log(vk.session.app_id);
    })
}

export {load_posts}