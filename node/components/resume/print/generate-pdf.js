var PDFDocument = require('pdfkit');
var Entities = require('html-entities').AllHtmlEntities;
var decode = Entities.decode;
var INCH = 72;
var SAIRA_EXTRA_CONDENSED_BOLD = __dirname+'/google-fonts/sairaextracondensed/SairaExtraCondensed-Bold.ttf';
var SAIRA_EXTRA_CONDENSED = __dirname+'/google-fonts/sairaextracondensed/SairaExtraCondensed-Regular.ttf';
var MERRIWEATHER = __dirname+'/google-fonts/merriweather/Merriweather-Regular.ttf';
var margins = {
  top: 0.25,
  right: 0.25,
  bottom: 0.25,
  left: 0.25
};
var fonts = {
  name: {
    family: SAIRA_EXTRA_CONDENSED_BOLD,
    size: 28
  },
  address: {
    family: SAIRA_EXTRA_CONDENSED_BOLD,
    size: 10.5
  },
  h1: {
    family: SAIRA_EXTRA_CONDENSED_BOLD,
    size: 18.2
  },
  h2: {
    family: SAIRA_EXTRA_CONDENSED_BOLD,
    size: 12.6
  },
  h3: {
    family: SAIRA_EXTRA_CONDENSED,
    size: 12.6
  },
  h4: {
    family: SAIRA_EXTRA_CONDENSED,
    size: 10.5
  },
  body: {
    family: MERRIWEATHER,
    size: 12
  }
};

function aboutSection(resume, doc) {
  var about = resume.sections.about;
  var my = about.me;
  if (my.displayName)
    doc
      .font(fonts.name.family)
      .fontSize(fonts.name.size)
      .text(decode(my.displayName.toUpperCase()), margins.left*INCH, margins.top*INCH, {
        width: 2 * INCH
      });

  var parts = [];
  if (my.addressLines && my.addressLines.length)
    my.addressLines.map((addressLine) => parts.push(addressLine));
  if (my.phoneNumber)
    parts.push(my.phoneNumber);
  if (my.emailAddress)
    parts.push(my.emailAddress);
  if (my.url)
    parts.push(my.url);
  if (parts.length > 0)
    doc
      .font(fonts.address.family)
      .fontSize(fonts.address.size)
      .text(decode(parts.join(' · ')).toUpperCase(), (margins.left+2) * INCH, margins.top*INCH, {
        width: 6 * INCH
      });
}

function objectiveSection(resume, doc) {
  var about = resume.sections.about;
  var my = about.me;
  if (my.objective) {
    doc
      .font(fonts.h1.family)
      .fontSize(fonts.h1.size)
      .text(decode('Objective').toUpperCase());
    doc.moveUp();
    doc
      .font(fonts.body.family)
      .fontSize(fonts.body.size)
      .text(decode(my.objective));
  }
}

function experienceSection(resume, doc) {
  var experience = resume.sections.experience;
  var history = experience.history;
  if (history.length > 0) {
    doc
      .font(fonts.h1.family)
      .fontSize(fonts.h1.size)
      .text(decode(experience.title).toUpperCase());
    for (var j = 0; j < history.length; j++) {
      var job = history[j];
      if (job.featured) {
        doc
          .font(fonts.h2.family)
          .fontSize(fonts.h2.size)
          .text(decode(job.title).toUpperCase());
        {
          var parts = [];
          if (job.project)
            parts.push(job.project);
          if (job.company)
            parts.push(job.company);
          if (job.location)
            parts.push(job.location);
          if (parts.length > 0)
            doc
              .font(fonts.h3.family)
              .fontSize(fonts.h3.size)
              .text(decode(parts.join(' · ')).toUpperCase());
        }
        doc
          .font(fonts.h4.family)
          .fontSize(fonts.h4.size)
          .text(decode(job.dates).toUpperCase());
      }
    }
  }
}

function educationSection(resume, doc) {
  var education = resume.sections.education;
  var qualifications = education.qualifications;
  if (qualifications.length > 0) {
    doc
      .font(fonts.h1.family)
      .fontSize(fonts.h1.size)
      .text(decode(education.title).toUpperCase());
    for (var q = 0; q < qualifications.length; q++) {
      var qualification = qualifications[q];
      // if (qualification.featured) {
      doc
        .font(fonts.h2.family)
        .fontSize(fonts.h2.size)
        .text(decode(qualification.degree).toUpperCase());
      var parts = [];
      if (qualification.majors) {
        var majors = qualification.majors.slice();
        if (majors.length > 2) {
          majors.splice(majors.length-1, 0, '&amp;');
          var major = majors.join(', ').replace('&amp;,', '&amp;');
          parts.push(major);
        }
        else if (majors.length == 2) {
          var major = majors.join(' &amp; ');
          parts.push(major);
        }
        else if (majors.length == 1)
          parts.push(majors[0]);
      }
      else if (qualification.major)
        parts.push(qualification.major);
      if (qualification.school)
        parts.push(qualification.school);
      if (qualification.location)
        parts.push(qualification.location);
      if (qualification.gpa)
        parts.push(qualification.gpa + ' GPA');
      if (parts.length > 0)
        doc
          .font(fonts.h3.family)
          .fontSize(fonts.h3.size)
          .text(decode(parts.join(' · ')).toUpperCase());
      doc
        .font(fonts.h4.family)
        .fontSize(fonts.h4.size)
        .text(decode(qualification.dates).toUpperCase());
      // }
    }
  }
}

function affiliationsSection(resume, doc) {
  var affiliations = resume.sections.affiliations;
  var memberships = affiliations.memberships;
  if (memberships.length > 0) {
    doc
      .font(fonts.h1.family)
      .fontSize(fonts.h1.size)
      .text(decode(affiliations.title).toUpperCase());
    for (var m = 0; m < memberships.length; m++) {
      var membership = memberships[m];
      // if (membership.featured) {
        {
          var parts = [];
          if (membership.membership)
            parts.push(membership.membership);
          if (membership.organization)
            parts.push(membership.organization);
          if (membership.location)
            parts.push(membership.location);
          doc
            .font(fonts.h3.family)
            .fontSize(fonts.h3.size)
            .text(decode(parts.join(' · ')).toUpperCase());
        }
        doc
          .font(fonts.h4.family)
          .fontSize(fonts.h4.size)
          .text(decode(membership.dates).toUpperCase());
      // }
    }
  }
}

function awardsSection(resume, doc) {
  var awards = resume.sections.awards;
  var awarded = awards.awards;
  if (awarded.length > 0) {
    doc
      .font(fonts.h1.family)
      .fontSize(fonts.h1.size)
      .text(decode(awards.title).toUpperCase());
    for (var a = 0; a < awarded.length; a++) {
      var award = awarded[a];
      // if (award.featured) {
        doc
          .font(fonts.h2.family)
          .fontSize(fonts.h2.size)
          .text(decode(award.award).toUpperCase());
        {
          var parts = [];
          if (award.issuer)
            parts.push(award.issuer);
          if (award.location)
            parts.push(award.location);
          doc
            .font(fonts.h3.family)
            .fontSize(fonts.h3.size)
            .text(decode(parts.join(' · ')).toUpperCase());
        }
        doc
          .font(fonts.h4.family)
          .fontSize(fonts.h4.size)
          .text(decode(award.dates).toUpperCase());
      // }
    }
  }
}

function generatePdf(stream, models) {
  // var experience = resume.sections.experience;
  // var education = resume.sections.education;
  var doc = new PDFDocument({ autoFirstPage: false });
  // var stream = source('resume.pdf');
  doc.pipe(stream);
  doc.addPage({
    margins: {
      top: margins.top * INCH,
      right: margins.right * INCH,
      bottom: margins.bottom * INCH,
      left: margins.left * INCH
    }
  });
  if (models && models.resume) {
    aboutSection(models.resume, doc);
    objectiveSection(models.resume, doc);
    experienceSection(models.resume, doc);
    educationSection(models.resume, doc);
    affiliationsSection(models.resume, doc);
    awardsSection(models.resume, doc);
  }
  else {
    doc.text('There was no data model provided for resume.');
  }
  doc.end();
  // stream.end();
}

module.exports = generatePdf;
