<a name="module_stashback"></a>
## stashback
A library for stashing and retrieving callbacks


* [stashback](#module_stashback)
  * [module.exports(options)](#exp_module_stashback--module.exports) ⏏
    * [~stash(key, callback, options)](#module_stashback--module.exports..stash)
    * [~unstash(key, options, The)](#module_stashback--module.exports..unstash)
    * [~stats()](#module_stashback--module.exports..stats) ⇒ <code>Object</code> \| <code>integer</code> \| <code>function</code>

<a name="exp_module_stashback--module.exports"></a>
### module.exports(options) ⏏
Returns a configured stashback object

**Kind**: Exported function  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.timeout | <code>integer</code> | Callback timeout in milliesconds |
| options.onUnknownKey | <code>function</code> | Function to be executed when instructed to unstash an unknown (or expired) key. Must be bound to the stashback instance |
| options.onDuplicateKey | <code>function</code> | Function to be executed when instructed to stash a duplicate key. Must be bound to the stashback instance |
| options.onExpiry | <code>function</code> | Function to be executed after expiring a key. Must be bound to the stashback instance |

<a name="module_stashback--module.exports..stash"></a>
#### module.exports~stash(key, callback, options)
Stashes a callback for subsequent retrieval

**Kind**: inner method of <code>[module.exports](#exp_module_stashback--module.exports)</code>  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> |  |
| callback | <code>function</code> |  |
| options | <code>Object</code> |  |
| options.onDuplicateKey | <code>function</code> | Function to be executed when instructed to stash a duplicate key. Must be bound to the stashback instance |
| options.onExpiry | <code>function</code> | Function to be executed after expiring a key. Must be bound to the stashback instance |
|  | <code>callback</code> |  |
|  | <code>Error</code> |  |

<a name="module_stashback--module.exports..unstash"></a>
#### module.exports~unstash(key, options, The)
Unstashes a callback for execution

**Kind**: inner method of <code>[module.exports](#exp_module_stashback--module.exports)</code>  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> |  |
| options | <code>Object</code> |  |
| options.onUnknownKey | <code>function</code> | Function to be executed when instructed to unstash an unknown (or expired) key. Must be bound to the stashback instance |
| options.onExpiry | <code>function</code> | Function to be executed after expiring a key. Must be bound to the stashback instance |
|  | <code>callback</code> |  |
|  | <code>Error</code> |  |
| The | <code>function</code> | stashed callback or a no-op callback in the event of an error |

<a name="module_stashback--module.exports..stats"></a>
#### module.exports~stats() ⇒ <code>Object</code> \| <code>integer</code> \| <code>function</code>
Provides statistics

**Kind**: inner method of <code>[module.exports](#exp_module_stashback--module.exports)</code>  
**Returns**: <code>Object</code> - stats<code>integer</code> - stats.stashed      The number of currently stashed callbacks<code>function</code> - stats.expired      The number of expired callbacks  
