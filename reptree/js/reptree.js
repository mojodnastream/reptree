/**
 * Created by reptree on 5/14/15.
 */
Parse.initialize("uhkcJ7Pe9n6lsXHCFXfmhp4dDnlUk42YqQbB5UEP", "K7QwJE2kHXg5OsSkAMS2RW4yihUkyLfgjdtBIyM4");
var currentUser = Parse.User.current();

$( document ).ready(function() {

    Parse.$ = jQuery;

    //initialize parse

    var imageURL;
    var userRealName = localStorage.getItem('name');
    var userRealLastName = localStorage.getItem('lastName');
    var userEmail = localStorage.getItem("email");
    var userPhoto = localStorage.getItem("profileImage");
    var userRole = localStorage.getItem("profileRole");
    var userHeadline = localStorage.getItem("profileHeadline");
    var needThis = localStorage.getItem("needThis");;
    var arrFollowerDetail = [];
    //check for active user session


    if (currentUser) {
        $(".navbar .form-logout").show();

        if(!userRealName) {
            var userProf = Parse.Object.extend("userProfile");
            var query = new Parse.Query(userProf);
            query.equalTo("username", Parse.User.current().get("username"));
            query.find({
                success: function (results) {

                    for (var i = 0; i < results.length; i++) {
                        var object = results[i];
                        needThis = results[0].id;
                        userRealName = object.get('firstName').toString();
                        userRealLastName = object.get('lastName').toString();
                        userEmail = object.get('email').toString();
                        userPhoto = object.get('profileImage');
                        userRole = object.get('profileRole').toString();
                        userHeadline = object.get('proHeadline').toString();

                        if(userPhoto) {
                            imageURL= userPhoto.url();
                            localStorage.setItem("profileImage", imageURL);
                            $(".welcomePhoto .userPhoto")[0].src = userPhoto.url();


                           // $.welcomePhoto.image(userPhoto.url(), {width: 1200, height: 1200, crop: "fit"})
                        }
                        //add simple data to local cache
                        localStorage.setItem('needThis', needThis);
                        localStorage.setItem('profileHeadline', userHeadline);
                        localStorage.setItem('profileRole', userRole);
                        localStorage.setItem('name', userRealName);
                        localStorage.setItem('lastName', userRealLastName);
                        localStorage.setItem('email', userEmail);

                        $(".userTitle").html(userRealName + " " + userRealLastName);
                        if(localStorage.getItem("profileRole")) {
                            $(".userAbout").html('<strong></strong> ' + userRole);
                            //alert('role');
                        }
                        //if(localStorage.getItem("profileHeadline")) {
                        //    $(".userHead").html('<strong>Headline: </strong> ' + userHeadline);
                        //    //alert('headline')
                        //}
                    }
                },
                error: function (error) {
                    //alert(Parse.User.current().get("username"))
                    alert("Error: " + error.code);
                }
            });

            //load skills if not already loaded
            if(!localStorage.getItem("skillsList")) {
                loadReps();
                //loadSkills();
                loadGigs();
                loadFollowers();
                lookUpSkills();
                lookUpUsers();

            }
        }
        else {
            if (userPhoto) {
                try {
                    $(".welcomePhoto .userPhoto")[0].src = userPhoto;
                    $(".welcomePhoto .userPhoto")[0].crop = "fit";

                }
                catch(err) {
                    window.location.href = "mytree.html";
                }
                //$(".postPhoto .userPhoto")[0].src = userPhoto;
            }

            if (localStorage.getItem("profileRole")) {
                $(".userAbout").html('<strong></strong> ' + userRole);
                //alert('role');
            }
            //if (localStorage.getItem("profileHeadline")) {
            //    $(".userHead").html('<strong>Headline: </strong> ' + userHeadline);
            //    //alert('headline')
            //}

            $(".userTitle").html(userRealName + " " + userRealLastName);
            loadReps();
            //loadSkills();
            loadGigs();
            loadFollowers();
            lookUpSkills();
            lookUpUsers();
        }

        $("a[href='index.html']").attr('href', 'mytree.html')
    }
    else {
        $(".navbar .form-logout").hide();
        var pName = window.location.pathname;

        if (pName.indexOf("index.html") < 0 && pName.indexOf("create.html") < 0) {

            window.location.href = "index.html";
        }
    }

    $('.form-create').on('submit', function(e) {

        // Prevent Default Submit Event
        e.preventDefault();

        var data = $(this).serializeArray(),
            role = data[0].value,
            first = data[1].value,
            last = data[2].value,
            email = data[3].value,
            password = data[4].value;

            //localStorage.setItem('profileHeadline', userHeadline);
            //localStorage.setItem('profileRole', userRole);
            localStorage.setItem('name', first);
            localStorage.setItem('lastName', last);
            localStorage.setItem('email', email);
            localStorage.setItem('profileRole', role);

        //execute account sign up
        var user = new Parse.User();
        user.set("username", email);
        user.set("password", password);
        user.set("email", email);

        user.signUp(null, {
            success: function (user) {
                var UserProfile = Parse.Object.extend("userProfile");
                var userProfile = new UserProfile();

                userProfile.set("firstName", first);
                userProfile.set("lastName", last);
                userProfile.set("userID", user.id);
                userProfile.set("email", email);
                userProfile.set("username", email);
                userProfile.set("profileRole", role);

                var profACL = new Parse.ACL(Parse.User.current());
                profACL.setPublicReadAccess(true);
                userProfile.setACL(profACL);
                userProfile.save(null, {
                    success: function(userProfile) {
                        $(location).attr('href', 'mytree.html');
                    },
                    error: function(userProfile, error) {

                        // error is a Parse.Error with an error code and message.
                        //alert('Failed to create new object, with error code: ' + error.message);
                    }
                });
            },
            error: function (user, error) {
                // Show the error message somewhere and let the user try again.
                //alert("Error: " + error.code + " " + error.message);
            }
        });
    });

    //execute user sign in
    $('.form-signin').on('submit', function(e) {

        // Prevent Default Submit Event
        e.preventDefault();

        // Get data from the form and put them into variables
        var data = $(this).serializeArray(),
            email = data[0].value,
            password = data[1].value;

        // Call Parse Login function with those variables
        Parse.User.logIn(email.toLowerCase(), password, {
            // If the username and password matches
            success: function (user) {
                $(location).attr('href', 'mytree.html');
            },
            // If there is an error
            error: function (user, error) {
                //alert('error dude');
            }
        });
    });

    //execute user session logout
    $('.form-logout').on('submit', function (e) {
        // Prevent Default Submit Event
        e.preventDefault();

        //console.log("Performing submit");

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
            localStorage.removeItem("luSkills");

            if (Parse.User.current()) {
                // console.log("Failed to log out!");
            }
        }
        window.location.href = "index.html";
    });

    function loadGigs(){

        var arrGigs = [];
        var userGigs = Parse.Object.extend("userGigs");
        var queryGigs = new Parse.Query(userGigs);
            queryGigs.equalTo("userID", currentUser.id);
            queryGigs.find({
            success: function (results) {
                for (var j = 0; j < results.length; j++) {
                    var object = results[j];

                    arrGigs.push(results[j].id,object.get('companyName').toString(),object.get('role').toString());

                }
                localStorage.setItem("gigsList", JSON.stringify(arrGigs));
            },
            error: function (error) {
                //TODO:wire up error logging
                //alert("Load Gig Error: " + error.code);
            }
        });
    }

    function loadFollowers(){
        var arrFollowers = [];
        var userFollowers = Parse.Object.extend("followers");
        var queryFollowers = new Parse.Query(userFollowers);
        queryFollowers.equalTo("follower", currentUser.id);
        queryFollowers.descending("lastName")
        queryFollowers.find({
            success: function (results) {
                for (var j = 0; j < results.length; j++) {
                    var object = results[j];

                    arrFollowers.push(object.get('following').toString());
                    getFollowerData(object.get('following').toString(),"loadFollowers");
                }
                localStorage.setItem("followerList", JSON.stringify(arrFollowers.sort()));
            },
            error: function (error) {
                //TODO:wire up error logging
                //alert("Load FOllower Error: " + error.code);
            }
        });
    }

    function getFollowerData(follower,func) {

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

                    var div = '<tr><td><a href=profile.html?uid=' +
                        object.get('userID').toString() + '>' +
                        object.get('firstName').toString() + ' ' +
                        object.get('lastName').toString() + '</a></td></tr>'
                    $('#tableContacts tbody').append(div);
                }
                localStorage.setItem("followerDetail", JSON.stringify(arrFollowerDetail.sort()));
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
        queryRep.equalTo("repToUser", currentUser.id);
        queryRep.find({
            success: function (results) {
                //localStorage.setItem("repList", "");
                for (var j = 0; j < results.length; j++) {
                    var object = results[j];
                    arrRep.push(object.get('repFromUser').toString() + ':' + object.get('skillName').toString());
                }
                localStorage.setItem("repList", JSON.stringify(arrRep));

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

        var repLists = localStorage.getItem("repList");
            repLists = JSON.parse(repLists);
        var skills = localStorage.getItem("skillsList");
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

                            }
                            //alert(getRepUserInfo(repLists[rl].toString().split(':')[0]));
                            repUsers = repUsers + ' ' + getRepUserInfo(repLists[rl].toString().split(':')[0]);
                            repUserCount++;
                        }
                    }
                    //if(repScore) {
                        var div = '<tr><td>' + skill; // + '<br> ' + repScore;
                        if(repUserCount > 0) {
                            div = div + '<br><a class="open-SkillReps btn btn-primary btn-lg" data-toggle="modal" href="#reppedListModal" data-id="' + skill + '">' + repUserCount + ' Reps' + '</a>';
                        }
                        div = div + '</td></tr>';
                        $('#tableSkills tbody').append(div);
                        repScore = ''
                        repUserCount=0;
                    //}
                }
                catch(err) {
                    //TODO:wire up error logging
                }
            }
    }

    function getRepUserInfo(user){
        var userName = '';
        var repUser = localStorage.getItem("followerDetail");
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
        querySkills.equalTo("userID", currentUser.id);

        //querySkills.ascending("skillName");
        querySkills.descending("score");
        //querySkills.ascending("skillName");
        querySkills.find({
            success: function (results) {
                localStorage.setItem("skillsList", "");
                for (var j = 0; j < results.length; j++) {
                    var object = results[j];

                    arrSKills.push(object.get('score') + ':' + object.get('skillName').toString());

                }
                //arrSKills = arrSKills.sort();
                //arrSKills = arrSKills.reverse();
                localStorage.setItem("skillsList", JSON.stringify(arrSKills));
                displaySkills();
            },
            error: function (error) {
                //TODO:wire up error logging
                //alert("Load Skills Error: " + error.code);
            }
        });
    }

    //process the rep+ from the user list
    $(document).on("click", ".doSaveProfile", function () {
        //var theUser=$(this).data('id');
        //alert(currentUser.id);
        //$("#titlediv h4").text('What would you like to update?');

        var fileUploadControl = $("#profilePhotoFileUpload")[0];
        if (fileUploadControl.files.length > 0) {
            var file = fileUploadControl.files[0];
            var name = "photo.jpg";

            var parseFile = new Parse.File(name, file);
        }
        parseFile.save().then(function() {
            // The file has been saved to Parse.

            var userProfile = Parse.Object.extend("userProfile");
            var profImg = new userProfile();
            //profImg.equalTo("userID", currentUser.id);
            profImg.id = needThis;
            profImg.set("profileImage", parseFile);
            profImg.save();
            $(".welcomePhoto .userPhoto")[0].src = parseFile.url();
        }, function(error) {
            // The file either could not be read, or could not be saved to Parse.
        });



    })
    //doImage();
});

//process the rep+ from the user list
$(document).on("click", ".open-editProfile", function () {
    //var theUser=$(this).data('id');
   //alert(currentUser.id);
    $("#titlediv h4").text('What would you like to update?');
});

function lookUpUsers() {
    var name = "";
    var arrLuUsers = [];
    var userUsers = Parse.Object.extend("userProfile");
    var queryUsers = new Parse.Query(userUsers);
    queryUsers.ascending("lastName");
    queryUsers.ascending("firstName");
    queryUsers.limit(1200);
    queryUsers.find({
        success: function (results) {
            localStorage.setItem("luUsers", "");
            for (var j = 0; j < results.length; j++) {
                var object = results[j];
                    name = object.get('firstName').toString() + ' ' + object.get('lastName').toString();
                arrLuUsers.push(name);

            }
            arrLuUsers = arrLuUsers.sort();

            localStorage.setItem("luUsers", JSON.stringify(arrLuUsers));

        },
        error: function (error) {
            //TODO:wire up error logging
            alert("Load Skills Error: " + error.code);
        }
    });
}
function lookUpSkills() {

    var arrLuSKills = [];
    var userSkills = Parse.Object.extend("lu_skills");
    var querySkills = new Parse.Query(userSkills);
    querySkills.ascending("Skill");
    querySkills.limit(1200);
    querySkills.find({
        success: function (results) {
            localStorage.setItem("luSkills", "");
            for (var j = 0; j < results.length; j++) {
                var object = results[j];

                arrLuSKills.push(object.get('Skill').toString().toLowerCase());

            }
            arrLuSKills = arrLuSKills.sort();

            localStorage.setItem("luSkills", JSON.stringify(arrLuSKills));

        },
        error: function (error) {
            //TODO:wire up error logging
            //alert("Load Skills Error: " + error.code);
        }
    });
}
function doRepNow(theUser) {

    var repTo = theUser.toString().split(':')[0];
    var repSkill = theUser.toString().split(':')[1];

    var NewRep = Parse.Object.extend("userRep");
    var newRep = new NewRep();

    newRep.set("repFromUser", currentUser.id);
    newRep.set("repToUser", repTo);
    newRep.set("skillName", repSkill);
    newRep.set("repLevel", 88);

    newRep.save(null, {
        success: function(newRep) {

        },
        error: function(newRep, error) {
            alert(error.message);
            // error is a Parse.Error with an error code and message.
            //alert('Failed to create new object, with error code: ' + error.message);
        }
    });
}

function doAddNewSkill(skill, user) {
    var NewSkill = Parse.Object.extend("skills");
    var newSkill = new NewSkill();

    newSkill.set("userID", user);
    newSkill.set("skillName", skill);
    newSkill.set("score", 0);

    newSkill.save(null, {
        success: function(newSkill) {

        },
        error: function(newSkill, error) {
            //alert(error.message);
            // error is a Parse.Error with an error code and message.
            //alert('Failed to create new object, with error code: ' + error.message);
        }
    });
}

//process the rep+ from the user list
$(document).on("click", ".open-AddSkills", function () {

    var skill = "";
    var skills = localStorage.getItem("luSkills");
    skills = JSON.parse(skills);

    for (g = 0; g < skills.length; g++) {

        skill = skills[g].toString();
        try {
            //alert(skill);
            var div = '<tr><td>' + skill; // + '<br> ' + repScore;


            div = div + '</td></tr>';

            //$('#tableAllSkills tbody').append(div);

            //}
        }
        catch(err) {
            //TODO:wire up error logging
            //alert(err.message);
        }
    }

   /* div = div + '<br><a class="open-AddSkill btn btn-primary btn-lg" data-toggle="modal" href="#addSkillsModal" data-id="' + skill + '">Add Skill</a>';
    alert(div);*/

});

//process the rep+ from the user list
$(document).on("click", ".open-AddContacts", function () {
    var contact = "";
    var contacts = localStorage.getItem("luUsers");
    contacts = JSON.parse(contacts);

    for (g = 0; g < contacts.length; g++) {

        skill = contacts[g].toString();
        try {
            //alert(skill);
            var div = '<tr><td>' + contact; // + '<br> ' + repScore;

            //div = div + '<br><a class="open-SkillReps btn btn-primary btn-lg" data-toggle="modal" href="#reppedListModal" data-id="' + skill + '">' + repUserCount + ' Reps' + '</a>';

            div = div + '</td></tr>';
            //$('#tableAllSkills tbody').append(div);

            //}
        }
        catch(err) {
            //TODO:wire up error logging
            //alert(err.message);
        }
    }

});

$('.form-add-skill').on('submit', function(e) {

    // Prevent Default Submit Event
    e.preventDefault();
    var skill = this.doSkillAdd.value;

    doAddNewSkill(skill, currentUser.id);
    this.doSkillAdd.value = '';
    loadReps();

});


//process the rep+ from the user list
$(document).on("click", ".open-RepUser", function () {
    var theUser=$(this).data('id');
    doRepNow(theUser);
});

//process the view profile click
$(document).on("click", ".open-RepUserProfile", function () {
    var theUser=$(this).data('id');
    window.location.href = 'profile.html?uid=' + theUser ;
    //alert(theUser);

});

//Build the modal for the list of people whom have repped a skill
$(document).on("click", ".open-SkillReps", function () {
    $('#tableReps tbody').empty();
    var theSkill = $(this).data('id');
    var repFrom = '';
    var repSkill = '';
    $("#titlediv h4").text('These people say you have ' + theSkill + ' skills!');

    var repLists = localStorage.getItem("repList");
    repLists = JSON.parse(repLists);
    var thePerson = localStorage.getItem("followerDetail");
    thePerson = JSON.parse(thePerson);

    for (g = 0; g < repLists.length; g++) {

        repFrom = repLists[g].toString().split(':')[0];
        repSkill = repLists[g].toString().split(':')[1];

        if(theSkill == repSkill){
            try {
                for (rl = 0; rl < thePerson.length; rl++) {
                    if (repFrom == thePerson[rl].toString().split(':')[0]) {
                        var div = '<tr><td>' + thePerson[rl].toString().split(':')[1] + '</td><td>' +
                            '<a class="open-RepUser btn btn-success" data-id="' + repFrom + ':' + repSkill + '">Rep+</a></td><td>' +
                            '<a class="open-RepUserProfile btn btn-primary" data-id="' + repFrom + '">View</a>' +
                            '</td></tr>';
                        $('#tableReps tbody').append(div);
                    }
                }
            }
            catch(err) {
                //TODO:wire up error logging
            }
        }
    }

});
var substringMatcher = function(strs) {
    return function findMatches(q, cb) {
        var matches, substringRegex;

        // an array that will be populated with substring matches
        matches = [];

        // regex used to determine if a string contains the substring `q`
        substrRegex = new RegExp(q, 'i');

        // iterate through the pool of strings and for any string that
        // contains the substring `q`, add it to the `matches` array
        $.each(strs, function(i, str) {
            if (substrRegex.test(str)) {
                matches.push(str);
            }
        });

        cb(matches);
    };
};

var skills = localStorage.getItem("luSkills");
skills = JSON.parse(skills);

$('#add-skills .typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 1
    },
    {
        name: 'skills',
        source: substringMatcher(skills)
    });

var contacts = localStorage.getItem("luUsers");
contacts = JSON.parse(contacts);

$('#add-users .typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 1
    },
    {
        name: 'users',
        source: substringMatcher(contacts)
    });

/*function doImage() {4

    $('.welcomePhoto img').each(function () {
        alert($(this).height());
        alert($(this).width());
        // Calculate aspect ratio and store it in HTML data- attribute
        var aspectRatio = $(this).width() / $(this).height();
        $(this).data("aspect-ratio", aspectRatio);
//alert(aspectRatio);
        // Conditional statement
        if ($(this).width() > $(this).height()) {
            // Image is landscape
            alert("landscape");
            $(this).css({
                width: "100%",
                height: "100%"
            });
        } else if ($(this).height() > $(this).width()) {
            alert("portrait");
            $(this).css({
                maxWidth: "100%"
            });
        } else {
            //alert('squary');
            // Image is square
            $(this).css({
                width: "100%",
                height: "100%"
            });
        }
    });*/
//}