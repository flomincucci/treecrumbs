function load_tree() {
    // Loads the json 

    if(typeof(_cache_data.jsondata) === "undefined"){
        $.getJSON(
            'data.json'
            ).done(
                function(data) {
                    _cache_data.jsondata = data;
                    update_breadcrumb(current_item);
                }
            ).fail(
                function() {
                    console.log('Failed to load data.json');
                }
        );
    } else {
        update_breadcrumb(current_item);
    }
}

function generate_breadcrumb(tree, parent, current, d, n) {
    var id = tree[1];

    //Add to the next or previous array
    if (id == current.substr(0, id.length) || id.length == 2) {
        var children = [];
        if (tree.length === 4) {
            for(var j = 0; j < tree[3].length; j++) {
                children.push([tree[3][j][0], tree[3][j][1], tree[3][j][2]]);
            }
            children.sort(compare_function);
        }
        d.push([tree[0], id, tree[2], children]);
    } else if (((current == id.substr(0, current.length)) && (id.length > current.length)) || id.length == 2) {
        if (parent == current) {
            n.push([tree[0], id, tree[2]]);
            n.sort(compare_function);
        }
    }

    if (tree.length === 4) {
        for (var i = 0; i < tree[3].length; i++) {
            generate_breadcrumb(tree[3][i], id, current, d, n);
        }
    }

}

function compare_function(a,b) {
    // Custom compare function, used to order the items
    if (a[0] < b[0]) {
        return -1;
    } else if (b[0] < a[0]) {
        return 1;
    } else {
        return 0;
    }
}

function update_breadcrumb(current_item) {
    var data = _cache_data.jsondata;
    b = [];
    n = [];
    generate_breadcrumb(data, '0', current_item, b, n);
    render_breadcrumb(b,n);
}

function render_breadcrumb(breadcrumbs, next) {
    //Generic template
    var template_crumb = '<li class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown" href="#">{{desc}} <b class="caret"></b></a> <span class="divider">&gt;</span>{{#ubic_sibs}}<ul class="dropdown-menu" aria-labelledby="dLabel">{{{ubic_sibs}}}</ul>{{/ubic_sibs}}</li>';

    //First and last item template
    var template_crumb_first = '<li class="root"><a href="javascript:change_item(\'{{cod}}\', \'{{type}}\')">{{desc}}</a><span class="divider">&gt;</span></li>';
    var template_crumb_last = '<li class="active dropdown"><a class="dropdown-toggle" data-toggle="dropdown" href="#">{{desc}} <b class="caret"></b></a>{{#has_child}}<span class="divider">/</span>{{/has_child}}{{#ubic_sibs}}<ul class="dropdown-menu" aria-labelledby="dLabel">{{{ubic_sibs}}}</ul>{{/ubic_sibs}}</li>';

    //Dropdown items
    var template_crumb_next = '<li id="{{cod}}"><a href="javascript:change_item(\'{{cod}}\', \'{{type}}\')">{{desc}}</a></li>';
    var dropdown = '<li class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown" href="#">Pick one <b class="caret"></b></a><ul class="dropdown-menu" aria-labelledby="dLabel">';

    var html = '';
    var last_elem = breadcrumbs[breadcrumbs.length - 1][3];

    //First
    var data_bread = {
        'codubic': breadcrumbs[0][1],
        'ubic': breadcrumbs[0][0],
        'tipo': breadcrumbs[0][2],
    }
    html += Mustache.to_html(template_crumb_first, data_bread);

    //The rest
    for (var i=1; i<(breadcrumbs.length - 1); i++) {
        var ubic_sibs = '';
        var sibs_list = breadcrumbs[i - 1][3];
        for(var j=0; j<sibs_list.length; j++) {
            var data_sib = {
                'cod': sibs_list[j][1],
                'desc': sibs_list[j][0],
                'type': sibs_list[j][2]
            }
            ubic_sibs += Mustache.to_html(template_crumb_next, data_sib);
        }
        var data_bread = {
            'cod': breadcrumbs[i][1],
            'desc': breadcrumbs[i][0],
            'type': breadcrumbs[i][2],
            'ubic_sibs': ubic_sibs
        }
        html += Mustache.to_html(template_crumb, data_bread);
    }

    //Last
    var ultimo = breadcrumbs.length - 1;
    if(ultimo){
      var sibs_list = breadcrumbs[ultimo - 1][3];
      var ubic_sibs = '';
      for(var j=0; j<sibs_list.length; j++) {
          var data_sib = {
              'codubic': sibs_list[j][1],
              'ubic': sibs_list[j][0],
              'tipo': sibs_list[j][2]
          }
          ubic_sibs += Mustache.to_html(template_crumb_next, data_sib);
      }
      var data_bread = {
          'cod': breadcrumbs[ultimo][1],
          'desc': breadcrumbs[ultimo][0],
          'type': breadcrumbs[ultimo][2],
          'ubic_sibs': ubic_sibs,
          'has_child': breadcrumbs[ultimo][3].length
      }
      html += Mustache.to_html(template_crumb_last, data_bread);
    }
    $('#breadcrumbs').html(html);

    if (next.length > 0) {
        for (var i=0; i<next.length; i++) {
            var data_next = {
                'cod': next[i][1],
                'desc': next[i][0],
                'type': next[i][2]
            }
            dropdown += Mustache.to_html(template_crumb_next, data_next);
        }
        dropdown += "</ul></li>";

        $('#breadcrumbs').append(dropdown);
    }
}
