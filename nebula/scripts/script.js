var D = require('Diagnostics')
var Textures = require('Textures')
var vidTex = Textures.get('remoteVidTex')

// monitor the state of the video texture
vidTex.state.monitor({fireOnInitialValue: true})
    .subscribe(function(event){
        D.log('Video texture state is ' + event.newValue)
        /*
            event.value is one of TexturesModule.ExternalTexture.State
            PENDING
            AVAILABLE
            FAILED
        */ 
    })