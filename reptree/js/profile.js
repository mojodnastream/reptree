/**
 * Created by reptree on 5/14/15.
 */

Parse.initialize("uhkcJ7Pe9n6lsXHCFXfmhp4dDnlUk42YqQbB5UEP", "K7QwJE2kHXg5OsSkAMS2RW4yihUkyLfgjdtBIyM4");
var currentUser = Parse.User.current();
var conID = getUrlVars()["uid"].split('#')[0];
var arrFollowerDetail = [];
var userRealName = '';
$( document ).ready(function() {

    Parse.$ = jQuery;

    //initialize parse
    //Parse.initialize("uhkcJ7Pe9n6lsXHCFXfmhp4dDnlUk42YqQbB5UEP", "K7QwJE2kHXg5OsSkAMS2RW4yihUkyLfgjdtBIyM4");

    //alert(conID);
    var imageURL;

    var userRealLastName = '';
    var userEmail = '';
    var userPhoto = '';
    var userRole = '';
    var userHeadline = '';
    //

    //check for active user session

    if (currentUser) {
        $(".navbar .form-logout").show();

        //if(!userRealName) {
        var userProf = Parse.Object.extend("userProfile");
        var query = new Parse.Query(userProf);
        query.equalTo("userID", conID);
        query.find({
            success: function (results) {

                for (var i = 0; i < results.length; i++) {
                    var object = results[i];
                    userRealName = object.get('firstName').toString();
                    userRealLastName = object.get('lastName').toString();
                    userEmail = object.get('email').toString();
                    userPhoto = object.get('profileImage');
                    userRole = object.get('profileRole').toString();
                    userHeadline = object.get('proHeadline').toString();

                    if (userPhoto) {
                        imageURL = userPhoto.url();
                        //localStorage.setItem("profileImage", imageURL);
                        $(".welcomePhoto .userPhoto")[0].src = userPhoto.url();
                    }
                    $(".userTitle").html(userRealName + " " + userRealLastName);
                    $(".userAbout").html('<strong></strong> ' + userRole);
                }
            },
            error: function (error) {
                //alert(Parse.User.current().get("username"))
                alert("Error: " + error.code);
            }
        });

        //load skills if not already loaded


        //loadSkills();
        //loadGigs();
        loadFollowers();
        loadReps();
        //}
    }
    else {

        $(".navbar .form-logout").hide();
        var pName = window.location.pathname;

        if (pName.indexOf("index.html") < 0 && pName.indexOf("create.html") < 0) {
            window.location.href = "index.html";
        }
    }

    //execute user session logout
    $('.form-logout').on('submit', function (e) {
        // Prevent Default Submit Event
        e.preventDefault();

        //logout current user
        if ( Parse.User.current() ) {
            Parse.User.logOut();
            $(location).attr('href','index.html');
            // check if really logged out
            localStorage.removeItem("name");
            localStorage.removeItem("lastName");
            localStorage.removeItem("email");
            localStorage.removeItem("profileImage");
            localStorage.removeItem("profileRole");
            localStorage.removeItem("profileHeadline");
            localStorage.removeItem("skillsList");
            localStorage.removeItem("gigsList");
            localStorage.removeItem("followerList");
            localStorage.removeItem("repList");
            localStorage.removeItem("followerDetail");
            localStorage.removeItem("pskillsList");

            if (Parse.User.current()) {
                // console.log("Failed to log out!");
            }
        }
        window.location.href = "index.html";
    });


    //doImage();
});

function loadGigs(){

    var arrGigs = [];
    var userGigs = Parse.Object.extend("userGigs");
    var queryGigs = new Parse.Query(userGigs);
    queryGigs.equalTo("userID", conID);
    queryGigs.find({
        success: function (results) {
            for (var j = 0; j < results.length; j++) {
                var object = results[j];
                arrGigs.push(results[j].id,object.get('companyName').toString(),object.get('role').toString());
            }
            //localStorage.setItem("gigsList", JSON.stringify(arrGigs));
        },
        error: function (error) {
            //alert("Load Gig Error: " + error.code);
        }
    });
}

function loadFollowers(){
    var arrFollowers = [];
    var userFollowers = Parse.Object.extend("followers");
    var queryFollowers = new Parse.Query(userFollowers);
    queryFollowers.equalTo("follower", conID);
    queryFollowers.descending("lastName")
    queryFollowers.find({
        success: function (results) {
            for (var j = 0; j < results.length; j++) {
                var object = results[j];

                arrFollowers.push(object.get('following').toString());
                getFollowerData(object.get('following').toString(),"loadFollowers");
            }
            localStorage.setItem("pfollowerList", JSON.stringify(arrFollowers.sort()));
        },
        error: function (error) {
            //TODO:wire up error logging
            //alert("Load FOllower Error: " + error.code);
        }
    });
}


function getFollowerData(follower,func) {
    var goToFile = 'profile.html';
    var userFollowerData = Parse.Object.extend("userProfile");
    var queryFollowerData = new Parse.Query(userFollowerData);
    queryFollowerData.equalTo("userID", follower);
    queryFollowerData.find({
        success: function (results) {
            for (var j = 0; j < results.length; j++) {
                var object = results[j];

                arrFollowerDetail.push(
                    object.get('userID') + ':' +
                    object.get('firstName').toString() + ' ' +
                    object.get('lastName').toString() + ':' +
                    object.get('profileRole'));
                if(object.get('userID').toString() == currentUser.id) {
                    goToFile = 'mytree.html';
                }
                else {
                    goToFile = 'profile.html';
                }

                var div = '<tr><td>' +
                    '<a href=' + goToFile + '?uid=' +
                    object.get('userID').toString() + '>' +
                    object.get('firstName').toString() + ' ' +
                    object.get('lastName').toString() + '</a></td></tr>'
                $('#tableContacts tbody').append(div);
            }
            localStorage.setItem("pfollowerDetail", JSON.stringify(arrFollowerDetail.sort()));
        },
        error: function (error) {
            //TODO:wire up error logging
            //alert("Get Follower Error: " + error.code);
        }
    });
}

function loadReps(){
    var arrRep = [];
    var userRep = Parse.Object.extend("userRep");
    var queryRep = new Parse.Query(userRep);
    queryRep.equalTo("repToUser", conID);
    queryRep.find({
        success: function (results) {
            //localStorage.setItem("repList", "");
            for (var j = 0; j < results.length; j++) {
                var object = results[j];
                arrRep.push(object.get('repFromUser').toString() + ':' + object.get('skillName').toString());
            }
            localStorage.setItem("prepList", JSON.stringify(arrRep));

            loadSkills();
        },
        error: function (error) {
            //TODO:wire up error logging
            //alert("Load Reps Error: " + error.code);
        }
    });
}

function displaySkills() {

    var repScore = '0';
    var repUsers = '';
    var skill = '0';
    var repUserCount =0
    var hasRepped = 'false';
    var repLists = localStorage.getItem("prepList");
    repLists = JSON.parse(repLists);
    var skills = localStorage.getItem("pskillsList");
    skills = JSON.parse(skills);

    for (g = 0; g < skills.length; g++) {
        repScore = '0';
        repUsers = '';
        skill = '';

        repScore = skills[g].toString().split(':')[0];
        skill = skills[g].toString().split(':')[1];
        try {
            for (rl = 0; rl < repLists.length; rl++) {
                if (skill == repLists[rl].toString().split(':')[1]) {
                    if(currentUser.id == repLists[rl].toString().split(':')[0]) {
                        hasRepped = 'true';
                    }
                    repUsers = repUsers + ' ' + getRepUserInfo(repLists[rl].toString().split(':')[0]);
                    repUserCount++;
                }
            }
            //if(repScore) {

            var div = '<tr><td>' + skill; // + '<br> ' + repScore;
            if(repUserCount > 0) {
                div = div + '<br><a class="open-SkillReps btn btn-primary btn-lg" data-toggle="modal" href="#reppedListModal" data-id="' + skill + '">' + repUserCount + ' Reps' + '</a>';
                if(hasRepped=='false') {
                    div = div + '&nbsp;<a class="open-RepUser btn btn-success btn-lg" data-id="'+ conID + ':' + currentUser.id + ':' + skill + '">Rep+</a>';
                }
                else {
                    div = div + '&nbsp;<a class="open-RepUserDelete btn btn-danger btn-lg" data-id="'+ conID + ':' + currentUser.id + ':' + skill + '">unRep-</a>';

                }
            }
            else {
                div = div + '<br><a class="open-RepUser btn btn-success btn-lg"  data-id="'+ conID + ':' + currentUser.id + ':' + skill + '">Rep+</a>';
            }
            div = div + '</td></tr>';

            $('#tableSkills tbody').append(div);
            repScore = ''
            repUserCount=0;
            hasRepped = 'false';
            //}
        }
        catch(err) {
            //TODO:wire up error logging
        }
    }
}

function getRepUserInfo(user){
    var userName = '';
    var repUser = localStorage.getItem("pfollowerDetail");
    repUser = JSON.parse(repUser);

    for(ru = 0; ru < repUser.length; ru++) {
        if(user == repUser[ru].toString().split(':')[0]) {
            userName = repUser[ru].toString().split(':')[1];
        }
    }
    return userName;
}

function loadSkills() {
    var arrSKills = [];
    var userSkills = Parse.Object.extend("skills");
    var querySkills = new Parse.Query(userSkills);
    querySkills.equalTo("userID", conID);
    querySkills.descending("score");
    querySkills.find({
        success: function (results) {
            localStorage.setItem("pskillsList", "");
            for (var j = 0; j < results.length; j++) {
                var object = results[j];

                arrSKills.push(object.get('score').toString() + ':' + object.get('skillName').toString());

            }
            //arrSKills = arrSKills.sort();
            //arrSKills = arrSKills.reverse();
            localStorage.setItem("pskillsList", JSON.stringify(arrSKills));
            displaySkills();
        },
        error: function (error) {
            //TODO:wire up error logging
            //alert("Load Skills Error: " + error.code);
        }
    });
}
function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function doRepRemove(theUser){
//alert(theUser);
    var repTo = theUser.toString().split(':')[0];
    var theSkill = theUser.toString().split(':')[2];

    var query = new Parse.Query('userRep');
    query.equalTo('skillName', theSkill);
    query.equalTo('repFromUser', currentUser.id);
    query.equalTo('repToUser', repTo);

    query.find().then(function(results) {
        return Parse.Object.destroyAll(results);
    }).then(function() {
        localStorage.removeItem("prepList");
        $('#tableSkills tbody').empty();
        loadReps();
    }, function(error) {
        alert(error.message);
    });
}

function doRepNow(theUser) {

    var repTo = theUser.toString().split(':')[0];
    var repSkill = theUser.toString().split(':')[2];

    var NewRep = Parse.Object.extend("userRep");
    var newRep = new NewRep();

    newRep.set("repFromUser", currentUser.id);
    newRep.set("repToUser", repTo);
    newRep.set("skillName", repSkill);
    newRep.set("repLevel", 88);

    newRep.save(null, {
        success: function(newRep) {
            localStorage.removeItem("prepList");
            $('#tableSkills tbody').empty();
            loadReps();
        },
        error: function(newRep, error) {
            alert(error.message);
            // error is a Parse.Error with an error code and message.
            //alert('Failed to create new object, with error code: ' + error.message);
        }
    });
}

//process the rep+ from the user list
$(document).on("click", ".open-RepUser", function () {
    var theUser=$(this).data('id');
    doRepNow(theUser);
    //alert(theUser);
});
$(document).on("click", ".open-RepUserDelete", function () {
    var theUser=$(this).data('id');
    doRepRemove(theUser);
    //alert(theUser);
});

//process the view profile click
$(document).on("click", ".open-RepUserProfile", function () {
    var theUser=$(this).data('id');
    if(theUser == currentUser.id) {
        window.location.href = 'mytree.html';
    }
    else {
        window.location.href = 'profile.html?uid=' + theUser;
    }
    //alert(theUser);

});

//Build the modal for the list of people whom have repped a skill
$(document).on("click", ".open-SkillReps", function () {
    $('#tableReps tbody').empty();
    var theSkill = $(this).data('id');
    var repFrom = '';
    var repSkill = '';
    $("#titlediv h4").text('These people say ' + userRealName + ' has ' + theSkill + ' skills!');
//alert(theSkill);
    var repLists = localStorage.getItem("prepList");
    repLists = JSON.parse(repLists);
    var thePerson = localStorage.getItem("pfollowerDetail");
    thePerson = JSON.parse(thePerson);

    for (g = 0; g < repLists.length; g++) {

        repFrom = repLists[g].toString().split(':')[0];
        repSkill = repLists[g].toString().split(':')[1];

        if(theSkill == repSkill){
            try {
                for (rl = 0; rl < thePerson.length; rl++) {

                    if (repFrom == thePerson[rl].toString().split(':')[0]) {

                        var div = '<tr><td>' + thePerson[rl].toString().split(':')[1] + '</td><td>' +
                            '<a class="open-RepUser btn btn-success" href="#giveRepModal" data-id="' + thePerson[rl].toString().split(':')[0] + ':' + conID + ':' + repSkill + '">Rep+</a></td><td>' +
                            '<a class="open-RepUserProfile btn btn-primary" data-id="' + repFrom + '">View</a>' +
                            '</td></tr>';
                        $('#tableReps tbody').append(div);
                    }
                }
            }
            catch(err) {
                //TODO:wire up error logging
                alert(err.message);
            }
        }
    }

});
